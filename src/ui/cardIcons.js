import {
  Fire,
  QuestMap,
  Lightning,
} from "@pxlkit/gamification";
import {
  Snowflake,
  PulsingSun,
  FallingSnow,
  Compass,
} from '@pxlkit/weather';
import {
  Upload,
  Download,
  ChainLink,
  LoadingSpinner,
} from '@pxlkit/ui';
import {
  UserGroup,
  Eye,
  Friends,
  Repost,
} from '@pxlkit/social';
import {
  Bug,
  TypingDots,
} from '@pxlkit/feedback';
import {
  ExplosionBurst,
  Shockwave,
  NeonStrobe,
  Twinkle,
} from '@pxlkit/effects';


export const CARD_ICONS = {
  escape: QuestMap,
  fireball: Fire,
  ice: Snowflake,
  blast: PulsingSun,
  frost: FallingSnow,
  shuffle: Bug,
  mirrorSwap: UserGroup,
  giant: Upload,
  shrink: Download,
  void: ChainLink,
  oracle: TypingDots,
  trueSight: Eye,
  twinMirror: Friends,
  reverse: Repost,
  resonance: LoadingSpinner,
  echo: ExplosionBurst,
  omniscience: Shockwave,
  stasis: Lightning,
  balance: Compass,
  chaos: Twinkle,
  world: NeonStrobe
};

export const DEFAULT_CARD_ICON = Fire;
