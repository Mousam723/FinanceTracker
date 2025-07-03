module.exports = {
    plugins: [
      require('@tailwindcss/postcss')(), // ✅ The new required plugin
      require('autoprefixer'),
    ],
  };
  