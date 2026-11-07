import { wordSchema } from '@/lib/export';

export const dynamic = 'force-static';

export function GET() {
  return Response.json(wordSchema());
}
