import { ImageLoader } from 'next/legacy/image';

export const ContentfulImageLoader: ImageLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 25}`;
};

export function handleErrors<A extends unknown[]>(
  p: (...args: A) => Promise<void>
): (...args: A) => void {
  return (...args: A) => {
    try {
      p(...args).catch((err) =>
        console.log('Error thrown asynchronously', err)
      );
    } catch (err) {
      console.log('Error thrown synchronously', err);
    }
  };
}
