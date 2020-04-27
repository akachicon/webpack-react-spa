const HtmlWebpackPlugin = require('html-webpack-plugin');

const filterTagsByPath = (tags, filters) => {
  const filtered = {
    tags: [],
    idxs: []
  };

  filtered.tags = tags.filter((tag, idx) => {
    const src = tag.attributes && tag.attributes.src;
    const href = tag.attributes && tag.attributes.href;
    const resourcePath = src || href;

    if (!resourcePath) return false;

    const pathMatch = filters.some(
      filter => resourcePath.match(filter)
    );

    if (pathMatch) {
      filtered.idxs.push(idx)
    }
    return pathMatch;
  });

  return filtered;
};

class HtmlWebpackInjectionPlugin {
  apply(compiler) {
    if (HtmlWebpackPlugin.getHooks) {
      compiler.hooks.compilation.tap('HtmlWebpackInjectionPlugin', compilation => {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
          'HtmlWebpackInjectionPlugin', (data, callback) => {
            const tags = [
              ...data.headTags,
              ...data.bodyTags
            ];
            const {
              head: headFilters,
              exclude: excludeFilters
            } = data.plugin.options.injection;

            let includedTags = tags;
            let headTags = tags;
            let headIdxs = [];

            if (Array.isArray(excludeFilters)) {
              includedTags = filterTagsByPath(tags, excludeFilters).tags;
              headTags = includedTags;
            }

            if (Array.isArray(headFilters)) {
              const filteredHead = filterTagsByPath(includedTags, headFilters);
              headTags = filteredHead.tags;
              headIdxs = filteredHead.idxs;
            }

            const bodyTags = includedTags.filter(
              (tag, idx) => !headIdxs.includes(idx)
            );

            data.headTags = headTags;
            data.bodyTags = bodyTags;

            callback(null, data);
          }
        )
      });
    }
  }
}

module.exports = HtmlWebpackInjectionPlugin;
