const HtmlWebpackPlugin = require('html-webpack-plugin');

const filterTagsByPath = (
  tags,
  filters,
  hasNoPathFilter = () => false
) => (
  tags.filter(tag => {
    const src = tag.attributes && tag.attributes.src;
    const href = tag.attributes && tag.attributes.href;
    const resourcePath = src || href;

    if (!resourcePath) {
      return hasNoPathFilter(tag);
    }

    return filters.some(
      filter => resourcePath.match(filter)
    );
  })
);

const filterNonPathHeadTags =
  ({ tagName }) => ['title', 'meta', 'style'].includes(tagName);

// place inline styles at the end
const rearrangeInlineStyles = tags => {
  const styleTags = [];
  const nonStyleTags = [];

  for (const tag of tags) {
    tag.tagName === 'style'
      ? styleTags.push(tag)
      : nonStyleTags.push(tag);
  }
  return [...nonStyleTags, ...styleTags];
};

// place inline scripts at the end
const rearrangeInlineScripts = tags => {
  const inlineScriptTags = [];
  const nonInlineScriptTags = [];

  for (const tag of tags) {
    const isInlineScript = tag.tagName === 'script'
      && !(tag.attributes && tag.attributes.src);

    isInlineScript
      ? inlineScriptTags.push(tag)
      : nonInlineScriptTags.push(tag);
  }
  return [...nonInlineScriptTags, ...inlineScriptTags];
};

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

            // do not check headFilters.length cause we still want to use filterNonPathHeadTags
            headTags = filterTagsByPath(includedTags, headFilters, filterNonPathHeadTags);

            const headTagsSet = new Set(headTags);
            const bodyTags = includedTags.filter(
              tag => !headTagsSet.has(tag)
            );
            const additionalTags = this.getAdditionalTags();

            additionalTags.head = additionalTags.head || [];
            additionalTags.body = additionalTags.body || [];

            data.headTags = rearrangeInlineStyles(
              [...headTags, ...additionalTags.head]
            );
            data.bodyTags = rearrangeInlineScripts(
              [...bodyTags, ...additionalTags.body]
            );

            callback(null, data);
          }
        )
      });
    }
  }
}

module.exports = HtmlWebpackInjectionPlugin;
