const getFreshnessThreshold = (hours) => {
    return new Date(Date.now() - hours * 60 * 60 * 1000); 
}

export { getFreshnessThreshold }