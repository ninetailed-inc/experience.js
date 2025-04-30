// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import zoid from 'zoid';

const BASE_URL = 'https://preview.widgets.ninetailed.io/v2';

type PreviewBridgeOptions = {
  url?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let bridge: any;

export const PreviewBridge = ({ url = BASE_URL }: PreviewBridgeOptions) => {
  if (!bridge) {
    bridge = zoid.create({
      tag: 'ninetailed-preview',
      url,

      dimensions: {
        width: `432px`,
        height: `100vh`,
      },
    });
  }

  return bridge();
};
