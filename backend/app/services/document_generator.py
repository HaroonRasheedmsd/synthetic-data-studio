import random
from typing import Dict, List, Any
from app.schemas.models import GenerationPlan

class DocumentGenerator:
    """Generates realistic HTML documents from synthetic relational world data."""

    CURRENCY_SYMBOLS = {
        "USD": "$", "GBP": "£", "PKR": "Rs.", "SAR": "SR", "EUR": "€", "CNY": "¥"
    }

    def generate_documents(self, data: Dict[str, List[Dict[str, Any]]], plan: GenerationPlan) -> List[Dict]:
        """
        Auto-detect the data domain and generate appropriate documents.
        Returns a list of document dicts with id, html, title, type, and summary fields.
        """
        currency = getattr(plan, "currency", "USD")
        symbol = self.CURRENCY_SYMBOLS.get(currency, "$")
        locale = getattr(plan, "locale", "en_US")
        table_names = list(data.keys())

        # Check for banking domain
        account_table = self._find_table(table_names, ["account", "bank", "checking"])
        transaction_table = self._find_table(table_names, ["transaction", "tx", "payment"])

        if account_table and transaction_table:
            return self._generate_bank_statements(data[account_table], data[transaction_table], symbol, currency, plan)

        # Check for e-commerce / order domain
        order_table = self._find_table(table_names, ["order", "invoice", "sale", "purchase"])
        customer_table = self._find_table(table_names, ["customer", "user", "client", "buyer"])

        if order_table and customer_table:
            return self._generate_invoices(data[order_table], data[customer_table], symbol, currency, plan)

        # Fallback to invoices using the first table
        if table_names:
            return self._generate_invoices(data[table_names[0]], [], symbol, currency, plan)

        return []

    def _generate_invoices(self, orders, customers, symbol, currency, plan):
        docs = []
        for i, order in enumerate(orders[:10]):
            customer = customers[i % len(customers)] if customers else {}
            docs.append(self._build_invoice(i + 1, order, customer, symbol, currency, plan))
        return docs

    def _generate_bank_statements(self, accounts, transactions, symbol, currency, plan):
        docs = []
        for i, account in enumerate(accounts[:10]):
            acct_num = self._get_field(account, ["account_number", "id", "acc_id"]) or f"ACCT-{i:04d}"
            # Find transactions for this account
            acct_txs = [tx for tx in transactions if self._get_field(tx, ["account", "id", "num"]) == acct_num]
            if not acct_txs:
                acct_txs = transactions[:5] # Fallback to some random txs
            docs.append(self._build_bank_statement(i + 1, account, acct_txs, symbol, currency, plan))
        return docs

    def _find_table(self, names: List[str], keywords: List[str]) -> str:
        """Return the first table name whose name contains any of the keywords."""
        for name in names:
            for kw in keywords:
                if kw in name.lower():
                    return name
        return None

    def _build_invoice(self, invoice_num: int, order: dict, customer: dict, symbol: str, currency: str, plan: GenerationPlan) -> Dict:
        """Build a single invoice dict with html and summary data."""
        # Extract meaningful fields from order and customer
        cust_name = self._get_field(customer, ["name", "full_name", "customer_name", "username"]) or f"Customer #{invoice_num}"
        cust_email = self._get_field(customer, ["email", "email_address"]) or "—"
        cust_addr = self._get_field(customer, ["address", "city", "location"]) or "—"

        # Find a numeric total-like field in order
        amount = self._get_numeric_field(order, ["total", "amount", "price", "value", "cost", "subtotal"]) 
        if amount is None:
            amount = round(random.uniform(20, 2000), 2)
        
        tax_rate = 0.08
        tax = round(float(amount) * tax_rate, 2)
        grand_total = round(float(amount) + tax, 2)

        order_id = self._get_field(order, ["id", "order_id", "invoice_id"]) or invoice_num
        order_date = self._get_field(order, ["date", "created_at", "order_date", "timestamp"]) or "2024-01-01"

        # Build line items from remaining order fields
        line_items = []
        skip_fields = {"id", "order_id", "invoice_id", "customer_id", "user_id", "total", "amount", "price", "date", "created_at"}
        for k, v in list(order.items())[:6]:
            if k.lower() not in skip_fields and v is not None:
                line_items.append({"description": k.replace("_", " ").title(), "qty": 1, "price": v})

        if not line_items:
            line_items = [{"description": "Synthetic Product", "qty": 1, "price": amount}]

        html = self._render_html(
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
            "document_number": f"INV-{invoice_num:04d}",
            "title": cust_name,
            "subtitle": f"{symbol}{grand_total:,.2f} | {str(order_date)}",
            "html": html,
        }

    def _build_bank_statement(self, stmt_num: int, account: dict, transactions: list, symbol: str, currency: str, plan: GenerationPlan) -> Dict:
        acct_name = self._get_field(account, ["name", "owner", "customer"]) or f"Account Holder {stmt_num}"
        acct_num = self._get_field(account, ["account_number", "id", "acc_id"]) or f"ACCT-{stmt_num:04d}"
        balance = self._get_numeric_field(account, ["balance", "amount", "total"]) or round(random.uniform(1000, 50000), 2)
        
        rows = ""
        for tx in transactions:
            tx_date = self._get_field(tx, ["date", "time", "created_at"]) or "2024-01-01"
            tx_desc = self._get_field(tx, ["desc", "merchant", "memo", "type"]) or "Card Transaction"
            tx_amt = self._get_numeric_field(tx, ["amount", "value", "price"]) or round(random.uniform(-500, 500), 2)
            color = "#16a34a" if float(tx_amt) >= 0 else "#dc2626"
            
            rows += f"""
            <tr>
              <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">{tx_date}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:500;">{tx_desc}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:13px;font-weight:600;color:{color};">{symbol}{float(tx_amt):,.2f}</td>
            </tr>"""

        html = f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Statement {stmt_num}</title></head>
<body style="font-family:'Inter',sans-serif;max-width:700px;margin:0 auto;padding:40px 24px;color:#0f172a;background:#fff;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;border-bottom:2px solid #f1f5f9;padding-bottom:20px;">
    <div>
      <div style="font-size:24px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">{plan.project_name}</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Official Bank Statement</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:20px;font-weight:700;color:#0f172a;">STATEMENT</div>
      <div style="font-size:13px;color:#64748b;margin-top:4px;">Generated: 2024-02-01</div>
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

  <h3 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:12px;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Recent Transactions</h3>
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
    This is a <strong>synthetic bank statement</strong> generated by Synthetic Data Studio. 
    No real personal or financial data was used.
  </div>
</body>
</html>"""

        return {
            "type": "Bank Statement",
            "document_number": f"STMT-{stmt_num:04d}",
            "title": acct_name,
            "subtitle": f"Balance: {symbol}{float(balance):,.2f}",
            "html": html,
        }

    def _get_field(self, d: dict, keys: List[str]):
        """Return the first non-None value from d whose key contains any keyword."""
        for k, v in d.items():
            for key in keys:
                if key in k.lower() and v is not None:
                    return str(v)
        return None

    def _get_numeric_field(self, d: dict, keys: List[str]):
        """Return the first numeric value from d whose key matches a keyword."""
        for k, v in d.items():
            for key in keys:
                if key in k.lower():
                    try:
                        return float(v)
                    except (TypeError, ValueError):
                        pass
        return None

    def _render_html(self, invoice_num, order_id, order_date, cust_name, cust_email, cust_addr,
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
<head><meta charset="UTF-8"><title>Invoice {invoice_num}</title></head>
<body style="font-family:'Segoe UI',sans-serif;max-width:700px;margin:0 auto;padding:40px 24px;color:#1e293b;background:#fff;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
    <div>
      <div style="font-size:24px;font-weight:800;color:#2563eb;letter-spacing:-0.5px;">{project_name}</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Synthetic Data Studio — Privacy-Safe Synthetic Data</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:28px;font-weight:700;color:#0f172a;">INVOICE</div>
      <div style="font-size:13px;color:#64748b;margin-top:4px;"># INV-{invoice_num:04d}</div>
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
      <div style="font-size:13px;color:#64748b;">Currency: <strong style="color:#1e293b;">{currency}</strong></div>
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
    <div style="min-width:240px;">
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
    This is a <strong>synthetic document</strong> generated by Synthetic Data Studio. 
    No real personal data was used. Generated for demonstration purposes only.
  </div>
</body>
</html>"""
