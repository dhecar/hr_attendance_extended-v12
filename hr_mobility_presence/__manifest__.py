{
    "name": """HR Presence Qr Scan""",
    "summary": """Scans QR codes via device's camera and put the information in the presence control""",
    "category": "HR",
    # "live_test_url": "",
    #"images": ["images/main.png"],
    "version": "12.0.1.0.1",
    "application": False,

    "author": "Sinergiainformatica.net, David Hernández",
    "support": "dhecar@gmail.com",
    "depends": ['hr'],
    "license": "LGPL-3",
    "price": 80.00,
    "currency": "EUR",
    "external_dependencies": {"python": [], "bin": []},
    "data": [
        "security/hr_qr_security.xml",
        "security/ir.model.access.csv",
        "views/assets.xml",
        "views/hr_views.xml",
    ],
    "qweb": [
        "static/src/xml/templates.xml",
    ],

    "auto_install": False,
    "installable": True,
}