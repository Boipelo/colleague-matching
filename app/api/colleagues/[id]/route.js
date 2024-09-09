import { NextResponse } from 'next/server';
import { updateColleague, deleteColleague } from '../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, photo, descriptions } = await request.json();
    const updatedColleague = await updateColleague(parseInt(id), name, photo, descriptions);
    return NextResponse.json(updatedColleague);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await deleteColleague(parseInt(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
