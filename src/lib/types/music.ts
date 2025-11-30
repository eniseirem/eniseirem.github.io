export interface Song {
    name: string;
    artist: string;
    img?: string;
    src?: string;
    genre: string;
    youtubeId?: string;
    youtubeEmbedUrl?: string;
    youtubePlaylistId?: string;
  }
  
  export type RepeatMode = "repeat" | "repeat_one" | "shuffle";