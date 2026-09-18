import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { updateCircular, deleteCircular, getCircularSignaturesStatus } from '@/src/lib/db-helpers';

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const statusData = await getCircularSignaturesStatus(parseInt(id));
    if (!statusData) {
      return NextResponse.json({ error: 'Circular not found' }, { status: 404 });
    }
    return NextResponse.json(statusData);
  } catch (error) {
    console.error("Failed to load circular status:", error);
    return NextResponse.json({ error: 'Failed to load circular status' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const result = await updateCircular(parseInt(id), body);
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Circular not found' }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Failed to update circular:", error);
    return NextResponse.json({ error: 'Failed to update circular' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const result = await deleteCircular(parseInt(id));
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Circular not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted: result[0] });
  } catch (error) {
    console.error("Failed to delete circular:", error);
    return NextResponse.json({ error: 'Failed to delete circular' }, { status: 500 });
  }
}
