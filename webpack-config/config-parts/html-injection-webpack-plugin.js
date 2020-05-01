const HtmlWebpackPlugin = require('html-webpack-plugin');

const filterTagsByPath = (tags, filters) => (
  tags.filter(tag => {
    const src = tag.attributes && tag.attributes.src;
    const href = tag.attributes && tag.attributes.href;
    const resourcePath = src || href;

    if (!resourcePath) return false;

    return filters.some(
      filter => resourcePath.match(filter)
    );
  })
);

class HtmlWebpackInjectionPlugin {
  constructor({
    head = [],
    exclude = [],
    getAdditionalTags = () => ({ head: [], body: [] })
  } = {}) {
    this.head = head;
    this.exclude = exclude;
    this.getAdditionalTags = getAdditionalTags;
  }

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
            } = this;

            let includedTags = tags;
            let headTags = tags;

            if (!Array.isArray(excludeFilters)) {
              throw new Error('"exclude" has to be of type Array or unspecified');
            }

            if (excludeFilters.length) {
              const excludedTags = filterTagsByPath(tags, excludeFilters);
              const excludedTagsSet = new Set(excludedTags);

              includedTags = tags.filter(
                tag => !excludedTagsSet.has(tag)
              );
            }

            if (!Array.isArray(headFilters)) {
              throw new Error('"head" has to be of type Array or unspecified');
            }

            if (headFilters.length) {
              headTags = filterTagsByPath(includedTags, headFilters);
            }

            const headTagsSet = new Set(headTags);
            const bodyTags = includedTags.filter(
              tag => !headTagsSet.has(tag)
            );
            const additionalTags = this.getAdditionalTags();

            additionalTags.head = additionalTags.head || [];
            additionalTags.body = additionalTags.body || [];

            data.headTags = [...headTags, ...additionalTags.head];
            data.bodyTags = [...bodyTags, ...additionalTags.body];

            callback(null, data);
          }
        )
      });
    }
  }
}

module.exports = HtmlWebpackInjectionPlugin;
