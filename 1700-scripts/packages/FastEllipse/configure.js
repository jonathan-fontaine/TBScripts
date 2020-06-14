function configure(packageFolder, packageName)
{
  if(about.isPaintMode())
    return;

  require("./index.js").registerTool(packageFolder);

  ScriptManager.addShortcut({
    id: "FastEllipseShortcut",
    text: "Fast Ellipse Tool",
    responder: "scriptResponder",
    slot: "onActionActivateToolByName(QString)",
    itemParameter: "com.jonathanfontaine.FastEllipse",
    longDesc: "Fast Ellipse Tool",
    order: "256",
    categoryId: "Tools",
    categoryText: "Scripts"
  });


  var customToolToolbar = new ScriptToolbarDef({
    id: "com.jonathanfontaine.ToolToolbar",
    text: "Jona Tools",
    customizable: true
  });

  customToolToolbar.addButton({
    text: "Fast Ellipse Tool",
    icon: "circle.png",
    checkable: true,
    responder: "scriptResponder",
    slot: "onActionActivateToolByName(QString)",
    itemParameter: "com.jonathanfontaine.FastEllipse",
    shortcut: "FastEllipseShortcut"
  });

  ScriptManager.addToolbar(customToolToolbar);
}

exports.configure = configure;
