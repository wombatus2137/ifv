export function getAssetURL(assetName) {
    return new URL(`../../assets/${assetName}`, import.meta.url);
}
