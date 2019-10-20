var expect = require('chai').expect;
var path = require('path');
var tree = require('../tree');
var fs = require('fs-extra');

var testBase = path.resolve(__dirname, './__data__');

function typof (val) {
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
}

describe('use with require', function () {

  let result;

  beforeEach(function (done) {
    if (!result) {
      tree({
        ignore: ['package.json', /node_modules\/bfolder\/node_modules/],
        o: path.resolve(__dirname, 'o.data'),
        l: 3,
        f: true,
        base: testBase,
        noreport: true,
        directoryFirst: true,
      }).then((res) => {
        result = res;
        done();
      });
    }
    else {
      done();
    }
  });

  it('should generate data tree', function () {
    var data = result.data;
    var report = result.report;
    expect(typof(data)).to.equal('object');
    var root = data.root;
    expect(typof(root)).to.equal('object');
    expect(root.type).to.equal('directory');
    expect(root.level).to.equal(0);
    expect(root.name).to.equal('__data__');
    expect(typof(root.path)).to.equal('string');
    expect(typof(root.children)).to.equal('array');
  });

  it('should generate report', function () {
    const generatedReport = fs.readFileSync(path.resolve(__dirname, 'o.data'));
    expect(generatedReport.toString()).to.equal(result.report);
  })
});
