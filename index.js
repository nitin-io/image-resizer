const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const stats = {
  directories: 0,
  files: {
    readed: 0,
    compressed: 0,
  },
};

const config = {
  height: 2000,
  width: 2000,
  inputFolderPath: path.resolve(__dirname, "assets"),
};

const directories = [config.inputFolderPath];
const dirStrClear = (str) =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-\/\\\\]+/g, "")
    .replace(/-$/, "")
    .replace(/[-_]+/g, "_") // Replace -_ with _
    .replace(/[-_]\.+/g, ".")
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
const clearStr = (str) =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-\/\\\\.]+/g, "")
    .replace(/-$/, "")
    .replace(/[-_]+/g, "_") // Replace -_ with _
    .replace(/[-_]\.+/g, ".")
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -

(async () => {
  while (directories.length > 0) {
    const directory = directories.shift();
    const toCreateFolder = clearStr(
      path.join(directory.replace("assets", "compressed"))
    );
    stats.directories++;
    fs.mkdirSync(toCreateFolder, {
      recursive: true,
    });
    const data = fs.readdirSync(directory, { withFileTypes: true });
    directories.push(
      ...data
        .filter((file) => file.isDirectory())
        .map((file) => path.join(directory, file.name))
    );
    const files = data.filter((file) => !file.isDirectory());
    // const file = path.join(directory, file.name);
    files.forEach(async (file) => {
      stats.files.readed++;
      console.log("Reading: ", clearStr(file.name), stats.files.readed);
      const buffer = fs.readFileSync(path.join(file.path, file.name));
      const metadata = await sharp(buffer).metadata();
      let compressed = buffer;
      if (
        metadata &&
        metadata.width > config.width &&
        metadata.height > config.height
      ) {
        console.log("Compressing: ", clearStr(file.name));
        compressed = await sharp(buffer)
          .resize(config.width, config.height)
          .toBuffer();
        stats.files.compressed++;
        console.log(
          "Compressed: ",
          clearStr(file.name),
          stats.files.compressed
        );
      }
      fs.writeFileSync(
        path.join(
          clearStr(file.path.replace("assets", "compressed")),
          clearStr(file.name)
        ),
        compressed
      );
    });
  }
})();
