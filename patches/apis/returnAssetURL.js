export function returnAssetUrl (assetName) {
    return new URL(
        `../../assets/${assetName}`,
        import.meta.url
        );
    }
