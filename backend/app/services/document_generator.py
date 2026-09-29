import random
from typing import Dict, List, Any
from app.schemas.models import GenerationPlan

class DocumentGenerator:
    """Generates realistic HTML documents (Invoices, Bank Statements, & Custom Narrative Reports) with clean short IDs in target locales."""

    CURRENCY_SYMBOLS = {
        "USD": "$", "GBP": "£", "PKR": "Rs.", "SAR": "SR", "EUR": "€", "CNY": "¥"
    }

    LOCALE_NARRATIVES = {
        "ur_PK": {
            "title": "تاریخِ پاکستان اور اہم ترین تاریخی مراحل",
            "subtitle": "مصنوعی دفتری و تحقیقی دستاویز - سنیکتھٹک ڈیٹا اسٹوڈیو",
            "header": "حکومت پاکستان - ریسرچ و ڈیٹا ہاؤس",
            "executive_summary_title": "خلاصہ رپورٹ (Executive Summary)",
            "summary_text": "یہ دستاویز پاکستان کی تاریخ، جغرافیائی اہمیت اور تاریخی ارتقاء کا جامع جائزہ پیش کرتی ہے۔ اس کا مقصد ڈیٹا سائنسدانوں اور محققین کو مکمل طور پر محفوظ مصنوعی ڈیٹا فراہم کرنا ہے۔",
            "milestones_title": "اہم ترین تاریخی واقعاتی خاکہ",
            "milestones": [
                {"year": "1947", "event": "قيامِ پاکستان اور قائدِ اعظم محمد علی جناح کی قیادت میں آزادی کا حصول۔"},
                {"year": "1956", "event": "پاکستان کے پہلے آئین کا نفاذ اور اسلامی جمہوریہ کی تشکیل۔"},
                {"year": "1973", "event": "متفقہ 1973 کے آئین کی منظوری جس نے وفاق کی بنیادیں مستحکم کیں۔"},
                {"year": "1998", "event": "ٹیکنالوجی اور دفاعی شعبے میں نمایاں پیش رفت۔"},
                {"year": "2024", "event": "ڈیجیٹلائزیشن، مصنوعی ذہانت اور سنیکتھٹک ڈیٹا کے جدید دور کا آغاز۔"}
            ],
            "footer": "یہ ایک مصنوعی دستاویز ہے جو صرف تعلیمی اور معلوماتی مظاہرے کے لیے تیار کی گئی ہے۔",
            "dir": "rtl"
        },
        "ar_SA": {
            "title": "التقرير التوثيقي والتاريخي الرسمي",
            "subtitle": "وثيقة تحليلات البيانات الاصطناعية - ستوديو البيانات",
            "header": "مركز البحوث والمعلومات الإحصائية",
            "executive_summary_title": "الملخص التنفيذي",
            "summary_text": "تقدم هذه الوثيقة تحليلاً شاملاً للمحطات التاريخية والاقتصادية ذات الصلة بالمنظومة الإقليمية والوطنية.",
            "milestones_title": "الجدول الزمني لأبرز المحطات",
            "milestones": [
                {"year": "1932", "event": "تأسيس المملكة العربية السعودية وإرساء دعائم النهضة."},
                {"year": "1970", "event": "طلاق خطط التنمية الاقتصادية الشاملة وبناء البنية التحتية."},
                {"year": "2016", "event": "إطلاق رؤية 2030 لتحول اقتصادي وتكنولوجي رائد."},
                {"year": "2024", "event": "اعتماد تقنيات الذكاء الاصطناعي والبيانات الاصطناعية الفائقة."}
            ],
            "footer": "هذه وثيقة اصطناعية جرى توليدها آلياً لأغراض الاختبار والتطوير.",
            "dir": "rtl"
        },
        "es_ES": {
            "title": "Informe Histórico y Documental de Síntesis",
            "subtitle": "Estudio de Datos Sintéticos y Análisis de Entorno",
            "header": "Instituto de Investigación y Datos Avanzados",
            "executive_summary_title": "Resumen Ejecutivo",
            "summary_text": "Este documento proporciona una visión general sintética de la evolución histórica, económica y estructural del entorno analizado.",
            "milestones_title": "Cronología de Hitos Destacados",
            "milestones": [
                {"year": "1978", "event": "Aprobación de la Constitución y consolidación democrática."},
                {"year": "1986", "event": "Integración en instituciones europeas e impulso tecnológico."},
                {"year": "2024", "event": "Adoptación de inteligencia artificial y generación de datos sintéticos."}
            ],
            "footer": "Documento sintético generado para demostración técnica y pruebas.",
            "dir": "ltr"
        },
        "zh_CN": {
            "title": "合成历史与结构分析官方报告",
            "subtitle": "Synthetic Data Studio 高级数据合成文档",
            "header": "数据科学与历史研究中心",
            "executive_summary_title": "执行摘要",
            "summary_text": "本文档全面梳理了目标领域的历史发展脉络与关键里程碑，为数据测试提供符合隐私合规的合成文本。",
            "milestones_title": "关键历史时间线",
            "milestones": [
                {"year": "1949", "event": "重要历史转折与现代化建设起点。"},
                {"year": "1978", "event": "改革开放与经济快速腾飞。"},
                {"year": "2024", "event": "全面应用人工智能与合成数据技术。"}
            ],
            "footer": "本文件为Synthetic Data Studio自动生成的测试合成文档。",
            "dir": "ltr"
        },
        "en_US": {
            "title": "Historical Context & Structural Analytical Report",
            "subtitle": "Synthetic Narrative Architecture — Privacy-Safe Document Engine",
            "header": "Institute for Data Science & Synthetic Analytics",
            "executive_summary_title": "Executive Summary",
            "summary_text": "This document outlines the overarching historical progression, demographic metrics, and relational dependencies of the target synthetic ecosystem.",
            "milestones_title": "Historical Chronology & Key Milestones",
            "milestones": [
                {"year": "1776", "event": "Declaration of Independence and establishment of democratic foundations."},
                {"year": "1969", "event": "Lunar landing and technological revolution in computing."},
                {"year": "1991", "event": "Emergence of the World Wide Web and global internet connectivity."},
                {"year": "2024", "event": "Deployment of privacy-safe Synthetic Data Studio and generative AI."}
            ],
            "footer": "Synthetic document generated by Synthetic Data Studio for testing and development purposes.",
            "dir": "ltr"
        }
    }

    def generate_documents(self, data: Dict[str, List[Dict[str, Any]]], plan: GenerationPlan) -> List[Dict]:
        """
        Generate distinct, clean documents:
        - Invoices (Short ID: INV-101, INV-102...)
        - Bank Statements (Short ID: STMT-201, STMT-202...)
        - Narrative Documents (Short ID: DOC-301, in target locale language)
        """
        currency = getattr(plan, "currency", "USD")
        symbol = self.CURRENCY_SYMBOLS.get(currency, "$")
        locale = getattr(plan, "locale", "en_US")
        table_names = list(data.keys())

        docs = []

        # 1. Generate Invoices
        order_table = self._find_table(table_names, ["order", "invoice", "sale", "purchase"])
        customer_table = self._find_table(table_names, ["customer", "user", "client", "buyer"])
        orders = data.get(order_table, []) if order_table else (data.get(table_names[0], []) if table_names else [])
        customers = data.get(customer_table, []) if customer_table else []

        for i in range(min(5, max(3, len(orders)))):
            order = orders[i] if i < len(orders) else {"id": i+101, "total": round(random.uniform(50, 1200), 2)}
            cust = customers[i % len(customers)] if customers else {"name": f"Customer {i+1}", "email": f"user{i+1}@example.com"}
            docs.append(self._build_invoice(i + 101, order, cust, symbol, currency, plan))

        # 2. Generate Bank Statements
        account_table = self._find_table(table_names, ["account", "bank", "checking"])
        transaction_table = self._find_table(table_names, ["transaction", "tx", "payment"])
        accounts = data.get(account_table, []) if account_table else customers
        transactions = data.get(transaction_table, []) if transaction_table else orders

        for i in range(min(3, max(2, len(accounts) if accounts else 2))):
            acct = accounts[i] if i < len(accounts) else {"name": f"Account Holder {i+1}", "id": f"ACCT-{i+201}"}
            docs.append(self._build_bank_statement(i + 201, acct, transactions, symbol, currency, plan))

        # 3. Generate Custom Narrative Document (In target locale language)
        docs.append(self._build_narrative_document(plan, locale, data))

        return docs

    def _find_table(self, names: List[str], keywords: List[str]) -> str:
        for name in names:
            for kw in keywords:
                if kw in name.lower():
                    return name
        return None

    def _build_invoice(self, invoice_num: int, order: dict, customer: dict, symbol: str, currency: str, plan: GenerationPlan) -> Dict:
        cust_name = self._get_field(customer, ["name", "full_name", "customer_name", "username"]) or f"Customer #{invoice_num}"
        cust_email = self._get_field(customer, ["email", "email_address"]) or f"cust{invoice_num}@example.com"
        cust_addr = self._get_field(customer, ["address", "city", "location"]) or "123 Synthetic Way"

        amount = self._get_numeric_field(order, ["total", "amount", "price", "value", "cost", "subtotal"]) 
        if amount is None:
            amount = round(random.uniform(50, 1500), 2)
        
        tax_rate = 0.08
        tax = round(float(amount) * tax_rate, 2)
        grand_total = round(float(amount) + tax, 2)

        order_id = self._get_field(order, ["id", "order_id", "invoice_id"]) or f"ORD-{invoice_num}"
        order_date = self._get_field(order, ["date", "created_at", "order_date", "timestamp"]) or "2024-03-15"

        line_items = []
        skip_fields = {"id", "order_id", "invoice_id", "customer_id", "user_id", "total", "amount", "price", "date", "created_at"}
        for k, v in list(order.items())[:6]:
            if k.lower() not in skip_fields and v is not None:
                line_items.append({"description": k.replace("_", " ").title(), "qty": 1, "price": v})

        if not line_items:
            line_items = [{"description": "Synthetic Service Package", "qty": 1, "price": amount}]

        html = self._render_invoice_html(
            invoice_num=invoice_num,
            order_id=order_id,
            order_date=order_date,
            cust_name=cust_name,
            cust_email=cust_email,
            cust_addr=cust_addr,
            line_items=line_items,
            subtotal=amount,
            tax=tax,
            grand_total=grand_total,
            symbol=symbol,
            currency=currency,
            project_name=plan.project_name,
        )

        return {
            "type": "Invoice",
            "document_number": f"INV-{invoice_num}",
            "title": cust_name,
            "subtitle": f"{symbol}{grand_total:,.2f} | {str(order_date)}",
            "html": html,
        }

    def _build_bank_statement(self, stmt_num: int, account: dict, transactions: list, symbol: str, currency: str, plan: GenerationPlan) -> Dict:
        acct_name = self._get_field(account, ["name", "owner", "customer"]) or f"Account Holder #{stmt_num}"
        acct_num = self._get_field(account, ["account_number", "id", "acc_id"]) or f"ACCT-{stmt_num}"
        balance = self._get_numeric_field(account, ["balance", "amount", "total"]) or round(random.uniform(1200, 45000), 2)
        
        rows = ""
        for tx in transactions[:6]:
            tx_date = self._get_field(tx, ["date", "time", "created_at"]) or "2024-03-01"
            tx_desc = self._get_field(tx, ["desc", "merchant", "memo", "type"]) or "Synthetic Transfer"
            tx_amt = self._get_numeric_field(tx, ["amount", "value", "price"]) or round(random.uniform(-400, 600), 2)
            color = "#16a34a" if float(tx_amt) >= 0 else "#dc2626"
            
            rows += f"""
            <tr>
              <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">{tx_date}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:500;">{tx_desc}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:13px;font-weight:600;color:{color};">{symbol}{float(tx_amt):,.2f}</td>
            </tr>"""

        html = f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Statement STMT-{stmt_num}</title></head>
<body style="font-family:'Inter',sans-serif;max-width:750px;margin:0 auto;padding:40px 24px;color:#0f172a;background:#fff;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;border-bottom:2px solid #f1f5f9;padding-bottom:20px;">
    <div>
      <div style="font-size:24px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">{plan.project_name}</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Official Bank Statement &amp; Financial Ledger</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:20px;font-weight:700;color:#0f172a;">STATEMENT</div>
      <div style="font-size:13px;color:#64748b;margin-top:4px;">Ref: STMT-{stmt_num}</div>
    </div>
  </div>

  <div style="display:flex;justify-content:space-between;margin-bottom:36px;gap:24px;">
    <div style="flex:1;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px;">Account Details</div>
      <div style="font-weight:600;font-size:16px;">{acct_name}</div>
      <div style="color:#64748b;font-size:14px;margin-top:4px;font-family:monospace;">{acct_num}</div>
    </div>
    <div style="text-align:right;background:#f8fafc;padding:16px;border-radius:12px;min-width:200px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px;">Ending Balance</div>
      <div style="font-size:24px;font-weight:800;color:#2563eb;">{symbol}{float(balance):,.2f}</div>
      <div style="font-size:12px;color:#64748b;">Currency: {currency}</div>
    </div>
  </div>

  <h3 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:12px;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Recent Ledger Transactions</h3>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr style="background:#f8fafc;">
        <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Date</th>
        <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Description</th>
        <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Amount</th>
      </tr>
    </thead>
    <tbody>{rows}</tbody>
  </table>

  <div style="border-top:2px solid #f1f5f9;padding-top:24px;text-align:center;font-size:12px;color:#94a3b8;">
    This is a <strong>privacy-safe synthetic bank statement</strong> generated by Synthetic Data Studio.
  </div>
</body>
</html>"""

        return {
            "type": "Bank Statement",
            "document_number": f"STMT-{stmt_num}",
            "title": acct_name,
            "subtitle": f"Balance: {symbol}{float(balance):,.2f}",
            "html": html,
        }

    def _build_narrative_document(self, plan: GenerationPlan, locale: str, data: Dict) -> Dict:
        """Build a rich, localized narrative document (e.g. Pakistan history, Legal SOW, Article) in target language."""
        content = self.LOCALE_NARRATIVES.get(locale, self.LOCALE_NARRATIVES["en_US"])
        direction = content.get("dir", "ltr")

        milestones_html = ""
        for m in content["milestones"]:
            milestones_html += f"""
            <div style="display:flex;gap:16px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #f1f5f9;">
              <div style="font-weight:800;color:#2563eb;font-size:15px;min-width:60px;">{m['year']}</div>
              <div style="font-size:14px;color:#334155;line-height:1.6;">{m['event']}</div>
            </div>"""

        table_summary_rows = ""
        for tname, rows in data.items():
            table_summary_rows += f"""
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#0f172a;">{tname}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;">{len(rows)} records</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#16a34a;font-weight:600;">Verified Active</td>
            </tr>"""

        html = f"""<!DOCTYPE html>
<html lang="{locale[:2]}" dir="{direction}">
<head>
  <meta charset="UTF-8">
  <title>{content['title']}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body style="font-family:'Noto Nastaliq Urdu','Inter',sans-serif;max-width:800px;margin:0 auto;padding:48px 32px;color:#0f172a;background:#fff;direction:{direction};">
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #2563eb;padding-bottom:20px;margin-bottom:32px;">
    <div>
      <div style="font-size:22px;font-weight:800;color:#2563eb;">{content['header']}</div>
      <div style="font-size:13px;color:#64748b;margin-top:4px;">{content['subtitle']}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:12px;font-weight:700;background:#eff6ff;color:#1d4ed8;padding:6px 14px;border-radius:20px;display:inline-block;">DOC-301</div>
    </div>
  </div>

  <h1 style="font-size:26px;font-weight:800;color:#0f172a;margin-bottom:16px;line-height:1.4;">{content['title']}</h1>
  
  <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:20px;border-radius:0 12px 12px 0;margin-bottom:32px;">
    <h3 style="font-size:15px;font-weight:700;color:#1e293b;margin:0 0 8px 0;">{content['executive_summary_title']}</h3>
    <p style="font-size:14px;color:#475569;margin:0;line-height:1.7;">{content['summary_text']}</p>
  </div>

  <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:20px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">{content['milestones_title']}</h2>
  <div style="margin-bottom:36px;">
    {milestones_html}
  </div>

  {f'''
  <h2 style="font-size:16px;font-weight:700;color:#0f172a;margin-bottom:16px;">مربوط مصنوعی ڈیٹا میٹرکس (Synthetic Data Summary)</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:32px;background:#f8fafc;border-radius:8px;overflow:hidden;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:10px 12px;font-size:12px;color:#64748b;">Table Name</th>
        <th style="padding:10px 12px;font-size:12px;color:#64748b;">Volume</th>
        <th style="padding:10px 12px;font-size:12px;color:#64748b;">Status</th>
      </tr>
    </thead>
    <tbody>{table_summary_rows}</tbody>
  </table>
  ''' if table_summary_rows else ''}

  <div style="border-top:2px solid #f1f5f9;padding-top:24px;text-align:center;font-size:12px;color:#94a3b8;margin-top:40px;">
    {content['footer']}
  </div>
</body>
</html>"""

        return {
            "type": "Narrative Document",
            "document_number": "DOC-301",
            "title": content["title"],
            "subtitle": f"Locale: {locale} | Direction: {direction.upper()}",
            "html": html,
        }

    def _get_field(self, d: dict, keys: List[str]):
        for k, v in d.items():
            for key in keys:
                if key in k.lower() and v is not None:
                    return str(v)
        return None

    def _get_numeric_field(self, d: dict, keys: List[str]):
        for k, v in d.items():
            for key in keys:
                if key in k.lower():
                    try:
                        return float(v)
                    except (TypeError, ValueError):
                        pass
        return None

    def _render_invoice_html(self, invoice_num, order_id, order_date, cust_name, cust_email, cust_addr,
                             line_items, subtotal, tax, grand_total, symbol, currency, project_name) -> str:
        rows = ""
        for item in line_items:
            rows += f"""
            <tr>
              <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;">{item['description']}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;text-align:center;">{item['qty']}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;text-align:right;">{symbol}{str(item['price'])[:8]}</td>
            </tr>"""

        return f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Invoice INV-{invoice_num}</title></head>
<body style="font-family:'Segoe UI',sans-serif;max-width:750px;margin:0 auto;padding:40px 24px;color:#1e293b;background:#fff;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
    <div>
      <div style="font-size:24px;font-weight:800;color:#2563eb;letter-spacing:-0.5px;">{project_name}</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Synthetic Data Studio — Privacy-Safe Billing Document</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:26px;font-weight:800;color:#0f172a;">INVOICE</div>
      <div style="font-size:13px;color:#64748b;margin-top:4px;"># INV-{invoice_num}</div>
    </div>
  </div>

  <div style="display:flex;justify-content:space-between;margin-bottom:36px;gap:24px;">
    <div style="flex:1;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px;">Bill To</div>
      <div style="font-weight:600;font-size:15px;">{cust_name}</div>
      <div style="color:#64748b;font-size:13px;margin-top:2px;">{cust_email}</div>
      <div style="color:#64748b;font-size:13px;">{cust_addr}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px;">Details</div>
      <div style="font-size:13px;color:#64748b;">Order ID: <strong style="color:#1e293b;">{order_id}</strong></div>
      <div style="font-size:13px;color:#64748b;">Date: <strong style="color:#1e293b;">{order_date}</strong></div>
      <div style="font-size:13px;color:#64748b;">Currency: <strong style="color:#1e293b;">{currency} ({symbol})</strong></div>
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#f8fafc;border-radius:12px;overflow:hidden;">
    <thead>
      <tr style="background:#f1f5f9;">
        <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Description</th>
        <th style="padding:12px 16px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Qty</th>
        <th style="padding:12px 16px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Amount</th>
      </tr>
    </thead>
    <tbody>{rows}</tbody>
  </table>

  <div style="display:flex;justify-content:flex-end;margin-bottom:40px;">
    <div style="min-width:260px;">
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">
        <span>Subtotal</span><span>{symbol}{float(subtotal):,.2f}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">
        <span>Tax (8%)</span><span>{symbol}{tax:,.2f}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:12px 0;font-weight:800;font-size:18px;color:#2563eb;">
        <span>Total Due</span><span>{symbol}{grand_total:,.2f}</span>
      </div>
    </div>
  </div>

  <div style="border-top:2px solid #f1f5f9;padding-top:24px;text-align:center;font-size:12px;color:#94a3b8;">
    This is a <strong>privacy-safe synthetic invoice</strong> generated by Synthetic Data Studio.
  </div>
</body>
</html>"""
