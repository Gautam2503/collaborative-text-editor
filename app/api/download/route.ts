// app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        const response = await fetch(fileUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Azure Storage error:', errorText);
            return new NextResponse(`Failed to fetch file: ${response.status} ${response.statusText}`, {
                status: response.status
            });
        }

        const data = await response.text();
        console.log(data);
        return new NextResponse(data, { status: 200 });
    } catch (error) {
        console.error('Download error:', error);
        return new NextResponse('Failed to download file', { status: 500 });
    }
}