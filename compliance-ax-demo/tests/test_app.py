import unittest
from streamlit.testing.v1 import AppTest

class AppTests(unittest.TestCase):
    def test_sample_and_export_ui(self):
        app=AppTest.from_file('app.py').run(timeout=30)
        self.assertFalse(app.exception)
        next(b for b in app.button if b.label.startswith('수집 →')).click().run(timeout=30)
        self.assertFalse(app.exception)
        self.assertEqual(app.metric[0].value,'4')
        next(b for b in app.button if b.label=='CSV + Parquet 함께 저장').click().run(timeout=30)
        self.assertFalse(app.exception)
        self.assertTrue(any('두 형식 저장 완료' in x.value for x in app.success))
        app.checkbox[1].uncheck().run()
        self.assertFalse(app.exception)
