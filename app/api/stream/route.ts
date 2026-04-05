import { spawn } from "child_process";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");

  if (!title) {
    return new Response("Missing title", { status: 400 });
  }

  try {
    const yt = spawn("yt-dlp", [
      "-f",
     "bestaudio[ext=m4a]/bestaudio[ext=webm]",
      "--no-playlist",
      "--quiet",
      "--no-warnings",
      "--extractor-args",
      "youtube:player_client=web",
      "--add-header",
      "User-Agent:Mozilla/5.0",
      `ytsearch1:${title}`,
      "-o",
      "-",
    ]);

    yt.stderr.on("data", (data) => {
      console.error("yt-dlp:", data.toString());
    });

    const stream = Readable.toWeb(
      yt.stdout
    ) as ReadableStream<Uint8Array>;

    return new Response(stream, {
      headers: {
        "Content-Type": "audio/mp4",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });

  } catch (error) {
    console.error(error);
    return new Response("Error streaming audio", { status: 500 });
  }
}

