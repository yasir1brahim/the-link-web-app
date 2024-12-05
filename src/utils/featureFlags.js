import { listFeatureFlags } from "../api/FeatureFlags/api"

const isFeatureFlagActive = async (featureFlagName) => {
    const featureFlags = await listFeatureFlags()
    console.log("featureFlags", featureFlags)
    return featureFlags.data['flags'][featureFlagName]['is_active']
}

export { isFeatureFlagActive }