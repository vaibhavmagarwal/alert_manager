alert_manager
=============

Manage Mozilla performance alerts generated by talos.

# Installation

The production alert_manager server is running on Ubuntu, so this is
probably the easiest environment in which to get things running, but other
distributions of linux should be fine as well. We use Apache on the
production server, but alert_manager will run standalone for testing as well.

## Instructions to get started with alert_manager development

alert_manager is best developed inside a Docker container for consistency across
platforms and to enable ease of deployment. Instructions on how to get Docker 
working on your system follow and should be enough to get an alert_manager
environment going:

### Linux based Alert Manager development with Docker

1. Visit [Docker][docker] and get docker up and running on  your system.

2. Add your user to the 'docker' system group. You may need to start a new terminal/session after doing this. Check the output of ``docker ps`` and if you don't see permissions warnings you should be fine.

3. Run the following git clone (specify a directory of your choosing if you like):

        git clone https://github.com/jmaher/alert_manager.git 

4. Run virtualenv on the git cloned directory to setup the Python virtual environment:

        virtualenv alert_manager

5. cd into the name of the directory into which you cloned the git repository

        cd alert_manager

6. Activate the virtual environment:

        source bin/activate

7. Run make to create your local docker containers:

        cd dockerfiles; make all

8. Start the collection of containers!

        fig up

9. Visit [http://localhost:8080/alerts.html][localhost] in your browser and you should be all set.


### OSX based Alert Manager development with Docker

1. Visit [Docker][docker] and get docker up and running on your system. And ensure that you run the
 export DOCKER_HOST=... lines when prompted:

        export DOCKER_HOST=tcp://192.168.59.103:2375

2. Run the following git clone to a directory of your choosing:

        git clone https://github.com/jmaher/alert_manager.git 

3. Run virtualenv on the git cloned directory to setup the Python virtual environment:

        virtualenv alert_manager

4. cd into the name of the directory into which you cloned the git repository

        cd alert_manager

5. Activate the virtual environment:

        source bin/activate

6. Run make to create your local docker containers:

        cd dockerfiles; make all

7. Start the collection of containers! (Note: maybe you need to install fig by pip install fig before you run it):

        fig up

8. Visit http://localhost:8080/alerts.html in your browser, or http://192.168.59.103:8080/alerts.html if localhost doesn't work and you should be all set. One thing need to point out is the IP address you visit is not restricted to "192.168.59.103", just keep it same as your docker environment host(DOCKER_HOST) which been setted in step 1.

### Windows based Alert Manager development with Docker

Windows based developers will be best served by installing [Vagrant][vagrant] and 
relying on a shim VM to run Docker. Follow the instructions in the installer until
you reach the ``vagrant init`` section. Instead of doing ``vagrant init hashicorp/precise32`` do:

    vagrant init ubuntu/trusty64

From there resume the install process and finish with:

    vagrant ssh
    
Once you have ssh'ed in, follow the [Linux based Alert Manager development with Docker][linux dev] instructions.

[docker]: https://docs.docker.com/installation/
[localhost]: http://localhost:8080/alerts.html
[vagrant]: https://docs.vagrantup.com/v2/getting-started/
[linux dev]: https://github.com/jamonation/alert_manager/blob/master/README.md#linux-based-alert-manager-development-with-docker

### Virtual environment (if your system doesn't have it already):

The Docker development environment relies on using a Python [virtual environment][venv]
for tools and portability across platforms. Ensure that you have Python Pip
installed for your platform before proceeding with these instructions.

Windows users can use the [following guide][windows venv]. Specifically, get
Python installed and then use the get-pip.py installer once Python is working

OSX users can use the built in version of Python as long as Pip is available,
or better, install [Brew and Python][osx venv].

Linux users should have Python already installed. Ensure Pip is installed via
your package manager and you should be all set.

[venv]: http://pypi.python.org/pypi/virtualenv
[wrapper]: http://www.doughellmann.com/projects/virtualenvwrapper/
[windows venv]: http://docs.python-guide.org/en/latest/starting/install/win/
[osx venv]: http://docs.python-guide.org/en/latest/starting/install/osx/
[bug]: https://github.com/docker/docker/issues/9628

## Git Pre-commit hook (Optional):

To enforce [Python code style][pep8] and avoid silly errors in your Python code,
you can set up git [pre-commit hook][git hooks], that will run checks on Python code you want to commit.

    ln -s ../../pre-commit.sh .git/hooks/pre-commit

In case you won't deal with found errors, you still can commit by issuing:

    git commit --no-verify

[pep8]: http://legacy.python.org/dev/peps/pep-0008/
[git hooks]: http://git-scm.com/book/en/Customizing-Git-Git-Hooks#Client-Side-Hooks

## Settings (For parse_news.py):

Alert manager supports environment-based settings.
To enable your own development settings you need to:

1. create local_settings/development.py file (just rename template file)

2. populate it with your settings

3. `export TARGET_ENVIRONMENT=development`


## Creating a config.ini file

The alert_manager uses a config.ini file to store identification and options.
You can create a default config.ini file by running:

    python config.py

Change the username and password for the database as required.

You will also either need a subscription to the mozilla.dev.tree-alerts
newsgroup, or make use of the sample data packaged in the sample folder.


## Database configuration:
Database setup and configuration scripts can all be found in <code>tests/resources/scripts</code>.
There are scripts for scrubbing and extracting the production database, plus
scripts for making a test database.

To create a test database for your dev machine

    python tests/resources/scripts/create_db.py

it uses your config.ini file to find **AND REPLACE** the schema with test data.

The database is populated by an instance of (datazilla-alerts)[https://github.com/klahnakoski/datazilla-alerts],
which is a whole other project.
