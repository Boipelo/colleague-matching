import { NextResponse } from 'next/server';
import { getColleagues, addColleague, updateColleague, deleteColleague } from '../../lib/db';

export async function GET() {
  try {
    const colleagues = await getColleagues();
    return NextResponse.json(colleagues);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, photo, descriptions } = await request.json();
    const newColleague = await addColleague(name, photo, descriptions);
    return NextResponse.json(newColleague, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, name, photo, descriptions } = await request.json();
    const updatedColleague = await updateColleague(id, name, photo, descriptions);
    return NextResponse.json(updatedColleague);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await deleteColleague(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}