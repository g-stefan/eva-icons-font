// Created by Grigore Stefan <g_stefan@yahoo.com>
// Public domain (Unlicense) <http://unlicense.org>
// SPDX-FileCopyrightText: 2024 Grigore Stefan <g_stefan@yahoo.com>
// SPDX-License-Identifier: Unlicense

const svgtofont = require('svgtofont');
const path = require('path');

svgtofont({
	src : path.resolve(process.cwd(), 'temp/svg'),
	dist : path.resolve(process.cwd(), 'output'),
	fontName : 'eva-icons',
	classNamePrefix : 'eva',
	css : true,
	svgicons2svgfont : {
		fontHeight : 1536,
		normalize : false
	},
	website : {
		title : "Custom Eva Icons Font",
		version : "1.1.3",
		logo : "",
		meta : {
			description : "",
			keywords : ""
		},
		description : ``,
		links : [
			{
				title: "Eva Icons",
				url: "https://github.com/akveo/eva-icons"
      			}
		],
		footerInfo : `Licensed under MIT license.`
	}
}).then(() => {
	console.log('done!');
});
