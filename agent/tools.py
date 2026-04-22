"""
Bookly agent tools — mock implementations for POC.

Each tool randomly returns one of 3 realistic responses.
Replace the body of each function with real API/DB calls when ready.

Tool contract matches the system prompt declarations:
  catalog_search, get_order, lookup_policy, similar_readers, escalate_to_human
"""
import random
from langchain_core.tools import tool


# ── catalog_search ────────────────────────────────────────────────────────────

@tool
def catalog_search(query: str, filters: str = "") -> str:
    """
    Search the Bookly book catalog by keyword, genre, author, format, price
    range, or reading level. Returns matching titles with availability and price.
    Always call this before answering questions about specific books, availability,
    or making recommendations.
    """
    responses = [
        (
            f'Catalog results for "{query}":\n'
            '1. "The Midnight Library" by Matt Haig — Paperback, $14.99 — In stock (12 copies)\n'
            '2. "Piranesi" by Susanna Clarke — Hardcover, $22.00 — In stock (4 copies)\n'
            '3. "The House in the Cerulean Sea" by TJ Klune — Paperback, $16.99 — In stock (8 copies)\n'
            'All titles available for in-store pickup or online order.'
        ),
        (
            f'Catalog results for "{query}":\n'
            '1. "Project Hail Mary" by Andy Weir — Paperback, $17.99 — In stock (6 copies)\n'
            '2. "Remarkably Bright Creatures" by Shelby Van Pelt — Hardcover, $27.99 — Low stock (2 copies)\n'
            '3. "Tomorrow, and Tomorrow, and Tomorrow" by Gabrielle Zevin — Paperback, $18.99 — In stock (9 copies)\n'
            'Tip: Members save 10% on all purchases.'
        ),
        (
            f'No exact matches found for "{query}". Closest results:\n'
            '1. "Lessons in Chemistry" by Bonnie Garmus — Paperback, $17.00 — In stock (7 copies)\n'
            '2. "The Atlas Six" by Olivie Blake — Paperback, $19.99 — In stock (3 copies)\n'
            'Would you like me to search with broader terms or check a different genre?'
        ),
    ]
    return random.choice(responses)


# ── get_order ─────────────────────────────────────────────────────────────────

@tool
def get_order(order_id: str, customer_id: str = "") -> str:
    """
    Retrieve order status, shipping details, and tracking information for a
    customer order. Accepts either an order ID (e.g. BKL-2026-88421) or a
    customer ID. Always call before answering any order status question.
    """
    responses = [
        (
            f'Order {order_id or "BKL-2026-88421"}:\n'
            'Status: Shipped ✓\n'
            'Items: "The Midnight Library" (×1), "Piranesi" (×1)\n'
            'Carrier: UPS — Tracking: 1Z999AA10123456784\n'
            'Estimated delivery: Tomorrow by 8 PM\n'
            'Ship-to: confirmed address on file.'
        ),
        (
            f'Order {order_id or "BKL-2026-91034"}:\n'
            'Status: Processing\n'
            'Items: "Project Hail Mary" (×2)\n'
            'Payment: Confirmed\n'
            'Expected to ship within 1–2 business days.\n'
            'You will receive a tracking email once dispatched.'
        ),
        (
            f'Order {order_id or "BKL-2026-77203"}:\n'
            'Status: Delivered ✓\n'
            'Items: "Lessons in Chemistry" (×1)\n'
            'Delivered: Yesterday at 2:34 PM — Left at front door\n'
            'Signed by: Not required (contactless delivery)\n'
            'If you did not receive this package, please let me know.'
        ),
    ]
    return random.choice(responses)


# ── lookup_policy ─────────────────────────────────────────────────────────────

@tool
def lookup_policy(topic: str) -> str:
    """
    Retrieve official Bookly store policies. Topics include: returns, refunds,
    shipping, gift cards, events, privacy, loyalty. Always call this before
    stating any policy detail — never quote policy from memory.
    """
    responses = [
        (
            f'Bookly policy — {topic}:\n'
            'Returns: Items may be returned within 30 days of purchase in original '
            'condition with receipt. Damaged or personalised items are non-returnable. '
            'Refunds are issued to the original payment method within 5–7 business days. '
            'Gift receipts allow exchange or store credit only.'
        ),
        (
            f'Bookly policy — {topic}:\n'
            'Shipping: Standard shipping (5–7 days) is free on orders over $25. '
            'Express (2 days) is $7.99. Same-day local delivery available in select '
            'zip codes for orders placed before 12 PM. International shipping calculated '
            'at checkout; duties are the buyer\'s responsibility.'
        ),
        (
            f'Bookly policy — {topic}:\n'
            'Loyalty programme: Earn 1 point per $1 spent. 100 points = $5 store credit. '
            'Points expire after 12 months of inactivity. Members receive early access '
            'to sales and author events. Points cannot be combined with other promotional '
            'discounts. Sign up free in-store or at bookly.com/loyalty.'
        ),
    ]
    return random.choice(responses)


# ── similar_readers ───────────────────────────────────────────────────────────

@tool
def similar_readers(title: str = "", customer_id: str = "") -> str:
    """
    Collaborative filtering recommendations. Given a book title or customer ID,
    returns what readers with similar taste bought or rated highly. Use during
    recommendation flows to personalise suggestions beyond RAG catalog results.
    """
    responses = [
        (
            f'Readers who loved "{title or "your recent reads"}" also enjoyed:\n'
            '1. "The Ten Thousand Doors of January" by Alix E. Harrow — 4.4★\n'
            '2. "A Memory Called Empire" by Arkady Martine — 4.3★\n'
            '3. "The Long Way to a Small, Angry Planet" by Becky Chambers — 4.5★\n'
            'All available in paperback under $18.'
        ),
        (
            f'Based on readers with your taste profile:\n'
            '1. "Babel" by R.F. Kuang — 4.6★ — "Readers of literary fantasy loved this"\n'
            '2. "The Poppy War" by R.F. Kuang — 4.2★\n'
            '3. "Jonathan Strange & Mr Norrell" by Susanna Clarke — 4.3★\n'
            'Tip: All three are part of our "Dark Academia" shelf, aisle 4.'
        ),
        (
            f'Collaborative signal for "{title or "your profile"}":\n'
            '1. "Nona the Ninth" by Tamsyn Muir — strong match (91% similarity)\n'
            '2. "A Psalm for the Wild-Built" by Becky Chambers — 88% match\n'
            '3. "The Galaxy, and the Ground Within" by Becky Chambers — 85% match\n'
            'These titles have high reread rates among similar customers.'
        ),
    ]
    return random.choice(responses)


# ── submit_return ─────────────────────────────────────────────────────────────

@tool
def submit_return(order_id: str, reason: str, item_ids: str = "") -> str:
    """
    Initiate a return or exchange for a customer order. Call this once the
    customer has confirmed they want to proceed and you have verified eligibility
    via get_order and lookup_policy. Accepts the order ID, reason for return
    (e.g. "wrong edition", "damaged", "changed mind"), and optionally a
    comma-separated list of item IDs to return.
    """
    return (
        f"Return request submitted for order {order_id}. ✓\n"
        f"Reason on file: {reason}\n"
        "A prepaid return label has been sent to your account email — "
        "please allow a few minutes for it to arrive.\n"
        "Once we receive the item, your refund will be processed within "
        "5–7 business days to your original payment method.\n"
        "You're all set — feel free to close this chat."
    )


# ── escalate_to_human ─────────────────────────────────────────────────────────

@tool
def escalate_to_human(summary: str, order_id: str = "", priority: str = "normal") -> str:
    """
    Hand off the conversation to a human support agent. Use when: the customer
    explicitly asks for a person, expresses strong frustration, the issue involves
    fraud or a lost package >7 days, or a refund >$50 is needed. Include a brief
    summary of the issue and any relevant order ID.
    """
    responses = [
        (
            f'Escalation submitted (priority: {priority}).\n'
            f'Ticket #SUP-{random.randint(10000,99999)} created for: "{summary[:80]}"\n'
            f'{"Order ref: " + order_id + chr(10) if order_id else ""}'
            'A support specialist will contact you at your account email within 2 business hours.\n'
            'You will receive a confirmation email shortly.'
        ),
        (
            f'Human agent notified (priority: {priority}).\n'
            f'Case reference: CSR-{random.randint(10000,99999)}\n'
            f'Issue summary forwarded: "{summary[:80]}"\n'
            'Current wait time: approximately 45 minutes.\n'
            'Our team will reach out via your preferred contact method on file.'
        ),
        (
            f'Escalated to senior support team (priority: {priority}).\n'
            f'Reference: ESC-{random.randint(10000,99999)}\n'
            'This conversation transcript has been attached so you will not need to repeat yourself.\n'
            'Direct line for urgent follow-up: support@bookly.com\n'
            'Expected response: within 1 business hour.'
        ),
    ]
    return random.choice(responses)


# ── Tool registry (used by generate_node) ─────────────────────────────────────

TOOLS = [catalog_search, get_order, lookup_policy, similar_readers, escalate_to_human, submit_return]

TOOL_MAP = {t.name: t for t in TOOLS}
