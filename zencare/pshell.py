def setup(env):
    request = env['request']

    # inject some vars into the shell builtins
    settings = env['registry'].settings
    request.environ['HTTP_HOST'] = settings['host']
