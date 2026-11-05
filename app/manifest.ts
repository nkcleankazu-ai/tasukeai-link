import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "たすけあいリンク",
    short_name: "たすけあい",
    description: "困りごとと助けたい気持ちをつなぐ",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf8",
    theme_color: "#173d35",
    icons: []
  };
}
