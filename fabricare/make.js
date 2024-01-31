// Created by Grigore Stefan <g_stefan@yahoo.com>
// Public domain (Unlicense) <http://unlicense.org>
// SPDX-FileCopyrightText: 2024 Grigore Stefan <g_stefan@yahoo.com>
// SPDX-License-Identifier: Unlicense

Fabricare.include("vendor");

messageAction("make");

if (Shell.fileExists("temp/build.done.flag")) {
	return;
};

if (!Shell.directoryExists("source")) {
	exitIf(Shell.system("7z x -aoa archive/" + Project.vendor + ".7z"));
	Shell.rename(Project.vendor, "source");
};

Shell.mkdirRecursivelyIfNotExists("output");
Shell.mkdirRecursivelyIfNotExists("temp");
Shell.mkdirRecursivelyIfNotExists("temp/svg-1");
Shell.mkdirRecursivelyIfNotExists("temp/svg-2");
Shell.mkdirRecursivelyIfNotExists("temp/png-1");
Shell.mkdirRecursivelyIfNotExists("temp/png-2");
Shell.mkdirRecursivelyIfNotExists("temp/svg");

var outputPath = Shell.getcwd() + "\\output";

Shell.setenv("PATH", "C:\\Program Files\\Inkscape\\bin;" + Shell.getenv("PATH"));

// ---

runInPath("temp", function() {
	if (!Shell.directoryExists("node_modules")) {
		exitIf(Shell.system("7z x -aoa ../archive/svgtofont.7z"));
	};
});

// ---

var job = new Job();
var jobsCount = 0;

	var fileList = Shell.getFileList("source/package/icons/outline/svg/*.svg");
	for (var j = 0; j < fileList.length; ++j) {
		var filename = Shell.getFileName(fileList[j]);
		var basename = Shell.getFileBasename(filename);

		var newName = basename.replace("-outline", "").toLowerCaseAscii();

		var svgContent = Shell.fileGetContents(fileList[j]);
		Shell.filePutContents("temp/svg-1/" + newName + ".svg", svgContent);

		job.addThread(function(icon) {
			Shell.system("inkscape --without-gui --export-type=\"png\" \"temp/svg-1/" + icon + ".svg\" \"--export-filename=temp/png-1/" + icon + ".png\" --export-width=768");
			if (!Shell.fileExists("temp/png-1/" + icon + ".png")) { // try again (can happen/antivirus scan)
				Shell.system("inkscape --without-gui --export-type=\"png\" \"temp/svg-1/" + icon + ".svg\" \"--export-filename=temp/png-1/" + icon + ".png\" --export-width=768");
			};
			if (Shell.fileExists("temp/png-1/" + icon + ".png")) {
				Shell.system("quantum-script fabricare/source/process.qs.js \"" + icon + "\"");
				Shell.system("vtracer --mode polygon --gradient_step 4 --colormode bw --path_precision 2 --segment_length 4 --corner_threshold 45 --input \"temp/png-2/" + icon + ".png\" --output \"temp/svg-2/" + icon + ".svg\" 1>NUL");

				var svgContent = Shell.fileGetContents("temp/svg-2/" + icon + ".svg");
				svgContent = svgContent.replace("<?xml version=\"1.0\" encoding=\"UTF-8\"?>", "");
				Shell.filePutContents("temp/svg/" + icon + ".svg", svgContent);
			} else {
				Console.writeLn("Conversion SVG to PNG failed: " + icon);
			};
		}, null, [ newName ], ++jobsCount);
	};


var infoMap = [ "|", "/", "-", "\\" ];
job.onEnd = function(process) {
	Console.write(infoMap[process.info % infoMap.length] + " [" + process.info + "/" + jobsCount + "]\r");
};
job.process();
Console.write("\n");

Shell.copy("fabricare/source/process.node.js", "temp/process.node.js");
Shell.system("node ./temp/process.node.js");

var html = Shell.fileGetContents("output/index.html");
html = html.replace(".icons ul li.class-icon [class^=\"eva-\"]{ font-size: 26px; }", ".icons ul li.class-icon [class^=\"eva-\"]{ font-size: 24px; color: #000000 !important;}");
html = html.replace("<div><a target=\"_blank\" href=\"https://github.com/jaywcjlove/svgtofont\">Created By svgtofont</a></div>", "");
Shell.filePutContents("output/index.html", html);

Shell.removeFile("output/symbol.html");
Shell.removeFile("output/unicode.html");
Shell.removeFile("output/eva-icons.eot");
Shell.removeFile("output/eva-icons.less");
Shell.removeFile("output/eva-icons.module.less");
Shell.removeFile("output/eva-icons.scss");
Shell.removeFile("output/eva-icons.styl");
Shell.removeFile("output/eva-icons.svg");
Shell.removeFile("output/eva-icons.symbol.svg");

var cssContent = Shell.fileGetContents("fabricare/source/eva-icons.header.css");
cssContent += "\r\n";
cssFilter = Shell.fileGetContents("output/eva-icons.css");
scan=cssFilter.indexOf("}") + 1;
cssContent += cssFilter.substring(cssFilter.indexOf("}",scan) + 1);
Shell.filePutContents("output/eva-icons.css", cssContent);
Shell.system("minify output/eva-icons.css > output/eva-icons.min.css");
Shell.copy("fabricare/source/eva-icons.license.txt", "output/eva-icons.license.txt");

Shell.filePutContents("temp/build.done.flag", "done");
