const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'backend/node_modules/typescript'));
const directories = ['backend/src', 'backend/tests', 'frontend/app', 'frontend/components', 'frontend/context', 'frontend/hooks', 'frontend/services', 'frontend/tests'];
const failures = [];
function checkImports(filename, source) {
  const relative = path.relative(root, filename).replaceAll('\\', '/');
  const layer = relative.startsWith('backend/src/domain/') ? 'domain' : relative.startsWith('backend/src/application/') ? 'application' : null;
  if (!layer) return;
  const check = literal => {
    if (!literal || !ts.isStringLiteralLike(literal)) return;
    const specifier = literal.text;
    const target = specifier.startsWith('.') ? path.relative(root, path.resolve(path.dirname(filename), specifier)).replaceAll('\\', '/') : specifier;
    const outward = layer === 'domain' ? ['application', 'infrastructure', 'presentation'] : ['infrastructure', 'presentation'];
    if (outward.some(name => target.startsWith(`backend/src/${name}/`) || specifier.split('/').includes(name))) {
      const line = ts.getLineAndCharacterOfPosition(tree, literal.getStart(tree)).line + 1;
      failures.push(`${relative}:${line}: ${layer} must not import ${specifier}`);
    }
  };
  const tree = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const inspect = node => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) check(node.moduleSpecifier);
    else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) check(node.moduleReference.expression);
    else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) check(node.arguments[0]);
    ts.forEachChild(node, inspect);
  };
  inspect(tree);
}
function visit(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, item.name);
    if (item.isDirectory()) visit(filename);
    else if (/\.(?:ts|tsx|css|cjs)$/.test(item.name)) {
      const source = fs.readFileSync(filename, 'utf8');
      const lines = source.trimEnd().split(/\r?\n/).length;
      if (lines > 200) failures.push(`${path.relative(root, filename)}: ${lines} lines`);
      checkImports(filename, source);
    }
  }
}
for (const directory of directories) visit(path.join(root, directory));
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('All application and test modules are within 200 lines; application and domain imports respect their architecture boundaries.');
