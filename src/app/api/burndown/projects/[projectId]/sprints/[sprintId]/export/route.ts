import { NextRequest, NextResponse } from 'next/server';
import { nestServer } from '@/lib/axios/server';
import { extractAuthToken } from '@/lib/auth/cookies';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; sprintId: string }> },
) {
  try {
    const { projectId, sprintId } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'png';

    const token = extractAuthToken(req);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await nestServer.get(
      `/projects/${projectId}/sprints/${sprintId}/burndown/export?format=${format}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'arraybuffer',
      },
    );

    const contentType =
      format === 'pdf'
        ? 'application/pdf'
        : format === 'svg'
          ? 'image/svg+xml'
          : 'image/png';

    return new NextResponse(response.data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=burndown-chart.${format}`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting burndown:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to export burndown chart',
      },
      { status: error.response?.status || 500 },
    );
  }
}
