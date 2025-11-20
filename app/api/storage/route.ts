
import { NextResponse } from 'next/server';
import { db } from '../../../lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
    }

    const id = db.save(content);
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: 'Storage failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  const item = db.get(id);
  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ content: item.content, createdAt: item.createdAt });
}

