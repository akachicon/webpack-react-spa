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
            const { head: headFilters } = data.plugin.options.injection;

            const filteredTags = filterTagsByPath(tags, headFilters);
            const headTags = filteredTags.tags;
            const bodyTags = tags.filter(
              (tag, idx) => !filteredTags.idxs.includes(idx)
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
