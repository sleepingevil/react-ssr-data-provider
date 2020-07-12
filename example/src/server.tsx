import path from 'path';
import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import express from 'express';

const app = express();

app.get('*', (req, res) => {
  const filePath = path.resolve(__dirname, '..', 'build', 'index.html');

  fs.readFile(filePath, 'utf8', (err, htmlData) => {
    if (err) {
      console.error('err', err);
      return res.status(404).end()
    }

    // render the app as a string
    const html = renderToString(<div>FUCK YOU</div>);

    // inject the rendered app into our html and send it
    return res.send(
      htmlData.replace(
        '<div id="root"></div>',
        `<div id="root">${html}</div>`
      )
    );
  });
});