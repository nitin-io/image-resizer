const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const stats = {
  directories: 0,
  files: 1,
};

const config = {
  height: 2000,
  width: 2000,
  inputFolderPath: path.resolve(__dirname, "assets"),
};

const directories = [config.inputFolderPath];

(async () => {
  while (directories.length > 0) {
    const directory = directories.shift();
    stats.directories++;
    const data = fs.readdirSync(directory, { withFileTypes: true });
    directories.push(
      ...data
        .filter((file) => file.isDirectory())
        .map((file) => path.join(directory, file.name))
    );
    const files = data
      .filter((file) => !file.isDirectory());
    // const file = path.join(directory, file.name);
    files.forEach(async (file) => {
      console.log(file.name, stats.files);
      stats.files++;
      const buffer = fs.readFileSync(path.join(file.path, file.name));
      const compressed = await sharp(buffer)
        .resize(config.width, config.height)
        .toBuffer();
      fs.mkdirSync(path.join(file.path.replace("assets", "compressed")), { recursive: true });
      fs.writeFileSync(
        path.join(file.path.replace("assets", "compressed"), file.name),
        compressed
      );
    });
  }
})();
