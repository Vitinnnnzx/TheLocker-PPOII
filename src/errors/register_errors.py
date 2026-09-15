from flask import render_template

def register_error_handlers(app):
    @app.errorhandler(404)
    def not_found(error):
        return render_template("errors-page/page404.html"), 404

    @app.errorhandler(401)
    def unauthorized(error):
        return render_template("errors-page/page401.html"), 401

    @app.errorhandler(405)
    def not_allowed(error):
        return render_template("errors-page/page405.html"), 405

    @app.errorhandler(503)
    def not_allowed(error):
        return render_template("errors-page/page503.html"), 503

    @app.errorhandler(500)
    def internal_error(error):
        return render_template("errors-page/page500.html"), 500
    