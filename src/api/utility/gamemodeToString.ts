import { Gamemode } from "../../interfaces/enum/gamemodes";

function gamemodeToString(gamemode: Gamemode): "osu" | "fruits" | "mania" | "taiko" | undefined {
    switch (gamemode) {
      case Gamemode.OSU:
        return "osu";
      case Gamemode.FRUITS:
        return "fruits";
      case Gamemode.MANIA:
        return "mania";
      case Gamemode.TAIKO:
        return "taiko";
      default:
        return undefined;
    }
  }