import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from('customers').select('*');
    return NextResponse.json({ data, error });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
