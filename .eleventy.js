// Eleventy builds the 12 static pages from src/ into _site/.
// The shared chrome (head, analytics, nav, footer) lives in src/_includes/base.njk;
// each page under src/en or src/it carries only its own <main> content plus front matter.
// Output URLs are identical to the hand-written site that preceded this build step.
module.exports = function (eleventyConfig) {
  // Assets are served as-is from the project root.
  eleventyConfig.addPassthroughCopy('css');
  eleventyConfig.addPassthroughCopy('js');
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('robots.txt');
  eleventyConfig.addPassthroughCopy('sitemap.xml');

  // Page bodies and metadata are trusted, hand-authored HTML fragments that already
  // carry their own entities (&amp;, &mdash;). Escaping them again would corrupt them.
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: false, trimBlocks: false });

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    templateFormats: ['njk'],
  };
};
