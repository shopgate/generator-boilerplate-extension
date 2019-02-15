const Generator = require('yeoman-generator');
const tarball = require('tarball-extract');

module.exports = class extends Generator {
  /**
   * @returns {Promise}
   */
  async prompting() {
    const prompts = [
      {
        type: 'input',
        name: 'organization',
        message: 'Please name your organization:',
        default: 'shopgate',
      },
      {
        type: 'input',
        name: 'extension',
        message: 'Please name your extension:',
      },
      {
        type: 'list',
        choices: ['UNLICENSED', 'Apache-2.0'],
        name: 'licence',
        message: 'What licence do you need?',
      },
      {
        type: 'input',
        name: 'repositoryUrl',
        message: 'If existent please add your repository url: ',
        default: 'n',
      },
    ];

    return this.prompt(prompts).then((props) => {
      this.props = props;

      this.config = {
        extension: {
          organization: this.props.organization,
          name: this.props.extension,
          licence: this.props.licence,
        },
        frontend: {
          active: true,
          tests: true,
          lint: true,
          'dependency-checker': true,
        },
        backend: {
          active: true,
          tests: true,
          lint: true,
          'dependency-checker': true,
        },
        'pre-commit': true,
        travis: {
          active: true,
          'slack-secure-key': '',
        },
      };

      const options = {
        config: this.config,
      };

      this.composeWith(require.resolve('../backend'), options);

      this.composeWith(require.resolve('../frontend'), options);

      this.composeWith(require.resolve('../repository'), {
        repositoryUrl: this.props.repositoryUrl,
      });

      this.composeWith(require.resolve('../travis'), options);

      this.composeWith(require.resolve('../readme'), options);

      this.composeWith(require.resolve('../licence'), options);

      this.composeWith(require.resolve('../docs'), options);

      this.composeWith(require.resolve('../changelog'), options);
    });
  }

  /**
   * @inheritDoc
   */
  writing() {
    const done = this.async();

    const extractionFolderName = 'generator-boilerplate-extension-template-master';
    tarball.extractTarballDownload(
      'https://codeload.github.com/shopgate-professional-services/generator-boilerplate-extension-template/tar.gz/master',
      this.destinationPath('./boilerplate.tar.gz'),
      this.destinationPath(`./extensions/${this.props.organization}-${this.props.extension}`),
      {},
      (err) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error('Error', err);
          return;
        }

        const extensionPath =
                this.destinationPath(`extensions/${this.props.organization}-${this.props.extension}/`);

        /**
         * A globOptions: dot preserves "dot files"
         */
        this.fs.move(
          `${extensionPath}${extractionFolderName}/**`,
          `${extensionPath}`,
          {
            ...this.config,
            globOptions: {
              dot: true,
            },
          }
        );

        this.fs.copyTpl(
          `${extensionPath}extension-config.json`,
          `${extensionPath}extension-config.json`,
          this.config
        );

        done();
      }
    );
  }

  /**
   * @inheritDoc
   */
  install() {
    process.chdir(`./extensions/${this.props.organization}-${this.props.extension}`);
    this.spawnCommandSync('rm', [
      '-rf',
      '../../boilerplate.tar.gz',
      './generator-boilerplate-extension-template-master',
    ]);
  }
};
