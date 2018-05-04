'use strict';
const Generator = require('yeoman-generator');
const remote = require('yeoman-remote');

module.exports = class extends Generator {
  async prompting() {
    const prompts = [
      {
        type: 'input',
        name: 'organization',
        message: 'Please name your organization:',
        default: 'shopgate'
      },
      {
        type: 'input',
        name: 'extension',
        message: 'Please name your extension:'
      },
      {
        type: 'list',
        choices: ['UNLICENSED', 'Apache-2.0'],
        name: 'licence',
        message: 'What licence do you need?'
      },
      {
        type: 'input',
        name: 'repositoryUrl',
        message: 'If existent please add your repository url: ',
        default: 'n'
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = props;

      this.config = {
        extension: {
          organization: this.props.organization,
          name: this.props.extension,
          licence: this.props.licence
        },
        frontend: {
          active: true,
          tests: true,
          lint: true,
          'dependency-checker': true
        },
        backend: {
          active: true,
          tests: true,
          lint: true,
          'dependency-checker': true
        },
        'pre-commit': true,
        travis: {
          active: true,
          'slack-secure-key': ''
        }
      };

      this.composeWith(require.resolve('../backend'), {
        config: this.config
      });

      this.composeWith(require.resolve('../frontend'), {
        config: this.config
      });

      this.composeWith(require.resolve('../repository'), {
        repositoryUrl: this.props.repositoryUrl
      });

      this.composeWith(require.resolve('../travis'), {
        config: this.config
      });

      this.composeWith(require.resolve('../readme'), {
        config: this.config
      });

      this.composeWith(require.resolve('../licence'), {
        config: this.config
      });
    });
  }

  writing() {
    const done = this.async();
    remote(
      'https://github.com/Menes1337/cloud-sdk-boilerplate-extension/archive/master.tar.gz',
      (err, cachePath) => {
        this.fs.copy(
          cachePath + '/**/*',
          this.destinationPath(
            `extensions/${this.props.organization}-${this.props.extension}`
          )
        );
        this.fs.copy(
          cachePath + '/.*',
          this.destinationPath(
            `extensions/${this.props.organization}-${this.props.extension}`
          )
        );

        const extensionPath = this.destinationPath(
          `extensions/${this.props.organization}-${this.props.extension}/`
        );

        this.fs.copyTpl(
          extensionPath + 'extension-config.json',
          extensionPath + 'extension-config.json',
          this.config
        );

        done();
      },
      false
    );
  }

  install() {
    process.chdir(`./extensions/${this.props.organization}-${this.props.extension}`);
  }
};
