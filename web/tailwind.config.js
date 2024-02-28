const { join } = require("path");

module.exports = {
  content: [
    join(
      __dirname,
      "{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}"
    ),
    join(__dirname, "../node_modules/flowbite-react/lib/esm/**/*.js"),
  ],
  theme: {
    extend: {
      width: {
        280: "280px",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
