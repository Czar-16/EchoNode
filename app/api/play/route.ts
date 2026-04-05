import { NextResponse } from "next/server";

import { spawn } from "child_process";

export async function POST(req: Request) {
  const body = await req.json();
  const title = body?.title;

  if (!title) {
    return NextResponse.json(
      { error: "Song title is required" },
      { status: 400 }
    );
  }

  try {
    const yt = spawn("yt-dlp", [
      "-f", // format selection
      "ba[acodec=opus]/ba/best",
      "--no-playlist",
      `ytsearch1:${title}`,
      "-o", // output  to stout
      "-", // don't save the file just stream
    ]);

    const player = spawn("mpv", [
      // run mpv and read audio form stdin

      "--no-terminal",
      "--msg-level=all=no",
      "-",
    ]);

    yt.stdout.pipe(player.stdin);

    yt.stderr.on("data", (data) => {
      console.error("yt-dlp:", data.toString());
    });

    player.stderr.on("data", (data) => {
      console.error("mpv:", data.toString());
    });

    return NextResponse.json({
      message: `Playing: ${title}`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to Paly" }, { status: 500 });
  }
}
