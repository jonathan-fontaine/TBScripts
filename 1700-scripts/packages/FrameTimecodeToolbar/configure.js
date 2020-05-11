function configure(packageFolder, packageName) {
  if (about.isPaintMode())
    return;

  var customToolToolbar = new ScriptToolbarDef({
    id: "com.jonathanfontaine.FrameTimecodeToolbar",
    text: "Frame Timecode Toolbar",
    customizable: true,
    floatable: true,

  });

  ScriptManager.addToolbar(customToolToolbar);
  require("./FrameToolBar.js").frameToolBar();
}

exports.configure = configure;
