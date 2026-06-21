// Linked List Algorithms Code

export const linkedListCode = {
  "middle-of-linked-list": {
    java: `public ListNode middleNode(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}`,
    python: `def middle_node(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow`,
    javascript: `function middleNode(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}`,
    typescript: `function middleNode(head: ListNode | null): ListNode | null {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow!.next;
        fast = fast.next.next;
    }
    return slow;
}`,
    csharp: `public ListNode MiddleNode(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}`,
    cpp: `ListNode* middleNode(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}`,
    go: `func middleNode(head *ListNode) *ListNode {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
    }
    return slow
}`
  },
  "reverse-linked-list": {
    java: `public ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
    python: `def reverse_list(head):
    prev, curr = None, head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev`,
    javascript: `function reverseList(head) {
    let prev = null, curr = head;
    while (curr) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
    typescript: `function reverseList(head: ListNode | null): ListNode | null {
    let prev: ListNode | null = null, curr = head;
    while (curr) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
    csharp: `public ListNode ReverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
    cpp: `ListNode* reverseList(ListNode* head) {
    ListNode *prev = nullptr, *curr = head;
    while (curr) {
        ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
    go: `func reverseList(head *ListNode) *ListNode {
    var prev *ListNode = nil
    curr := head
    for curr != nil {
        next := curr.Next
        curr.Next = prev
        prev = curr
        curr = next
    }
    return prev
}`
  },
  "merge-two-sorted-lists": {
    java: `public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) { curr.next = l1; l1 = l1.next; }
        else { curr.next = l2; l2 = l2.next; }
        curr = curr.next;
    }
    curr.next = l1 != null ? l1 : l2;
    return dummy.next;
}`,
    python: `def merge_two_lists(l1, l2):
    dummy = curr = ListNode(0)
    while l1 and l2:
        if l1.val <= l2.val: curr.next, l1 = l1, l1.next
        else: curr.next, l2 = l2, l2.next
        curr = curr.next
    curr.next = l1 or l2
    return dummy.next`,
    javascript: `function mergeTwoLists(l1, l2) {
    const dummy = new ListNode(0);
    let curr = dummy;
    while (l1 && l2) {
        if (l1.val <= l2.val) { curr.next = l1; l1 = l1.next; }
        else { curr.next = l2; l2 = l2.next; }
        curr = curr.next;
    }
    curr.next = l1 || l2;
    return dummy.next;
}`,
    typescript: `function mergeTwoLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    const dummy = new ListNode(0);
    let curr: ListNode = dummy;
    while (l1 && l2) {
        if (l1.val <= l2.val) { curr.next = l1; l1 = l1.next; }
        else { curr.next = l2; l2 = l2.next; }
        curr = curr.next;
    }
    curr.next = l1 || l2;
    return dummy.next;
}`,
    csharp: `public ListNode MergeTwoLists(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) { curr.next = l1; l1 = l1.next; }
        else { curr.next = l2; l2 = l2.next; }
        curr = curr.next;
    }
    curr.next = l1 ?? l2;
    return dummy.next;
}`,
    cpp: `ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
    ListNode dummy(0);
    ListNode* curr = &dummy;
    while (l1 && l2) {
        if (l1->val <= l2->val) { curr->next = l1; l1 = l1->next; }
        else { curr->next = l2; l2 = l2->next; }
        curr = curr->next;
    }
    curr->next = l1 ? l1 : l2;
    return dummy.next;
}`,
    go: `func mergeTwoLists(l1 *ListNode, l2 *ListNode) *ListNode {
    dummy := &ListNode{}
    curr := dummy
    for l1 != nil && l2 != nil {
        if l1.Val <= l2.Val {
            curr.Next = l1
            l1 = l1.Next
        } else {
            curr.Next = l2
            l2 = l2.Next
        }
        curr = curr.Next
    }
    if l1 != nil { curr.Next = l1 } else { curr.Next = l2 }
    return dummy.Next
}`
  },
  "remove-nth-from-end": {
    java: `public ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0, head);
    ListNode first = dummy, second = dummy;
    for (int i = 0; i <= n; i++) first = first.next;
    while (first != null) {
        first = first.next;
        second = second.next;
    }
    second.next = second.next.next;
    return dummy.next;
}`,
    python: `def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    first = second = dummy
    for _ in range(n + 1): first = first.next
    while first:
        first = first.next
        second = second.next
    second.next = second.next.next
    return dummy.next`,
    javascript: `function removeNthFromEnd(head, n) {
    const dummy = new ListNode(0, head);
    let first = dummy, second = dummy;
    for (let i = 0; i <= n; i++) first = first.next;
    while (first) { first = first.next; second = second.next; }
    second.next = second.next.next;
    return dummy.next;
}`,
    typescript: `function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
    const dummy = new ListNode(0, head);
    let first: ListNode | null = dummy, second: ListNode = dummy;
    for (let i = 0; i <= n; i++) first = first!.next;
    while (first) { first = first.next; second = second.next!; }
    second.next = second.next!.next;
    return dummy.next;
}`,
    csharp: `public ListNode RemoveNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0, head);
    ListNode first = dummy, second = dummy;
    for (int i = 0; i <= n; i++) first = first.next;
    while (first != null) { first = first.next; second = second.next; }
    second.next = second.next.next;
    return dummy.next;
}`,
    cpp: `ListNode* removeNthFromEnd(ListNode* head, int n) {
    ListNode dummy(0, head);
    ListNode *first = &dummy, *second = &dummy;
    for (int i = 0; i <= n; i++) first = first->next;
    while (first) { first = first->next; second = second->next; }
    second->next = second->next->next;
    return dummy.next;
}`,
    go: `func removeNthFromEnd(head *ListNode, n int) *ListNode {
    dummy := &ListNode{Next: head}
    first, second := dummy, dummy
    for i := 0; i <= n; i++ { first = first.Next }
    for first != nil { first = first.Next; second = second.Next }
    second.Next = second.Next.Next
    return dummy.Next
}`
  },
  "linked-list-cycle-2": {
    java: `public ListNode detectCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {
            slow = head;
            while (slow != fast) { slow = slow.next; fast = fast.next; }
            return slow;
        }
    }
    return null;
}`,
    python: `def detect_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            slow = head
            while slow != fast:
                slow = slow.next
                fast = fast.next
            return slow
    return None`,
    javascript: `function detectCycle(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next; fast = fast.next.next;
        if (slow === fast) {
            slow = head;
            while (slow !== fast) { slow = slow.next; fast = fast.next; }
            return slow;
        }
    }
    return null;
}`,
    typescript: `function detectCycle(head: ListNode | null): ListNode | null {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow!.next; fast = fast.next.next;
        if (slow === fast) {
            slow = head;
            while (slow !== fast) { slow = slow!.next; fast = fast!.next; }
            return slow;
        }
    }
    return null;
}`,
    csharp: `public ListNode DetectCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next; fast = fast.next.next;
        if (slow == fast) {
            slow = head;
            while (slow != fast) { slow = slow.next; fast = fast.next; }
            return slow;
        }
    }
    return null;
}`,
    cpp: `ListNode* detectCycle(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next; fast = fast->next->next;
        if (slow == fast) {
            slow = head;
            while (slow != fast) { slow = slow->next; fast = fast->next; }
            return slow;
        }
    }
    return nullptr;
}`,
    go: `func detectCycle(head *ListNode) *ListNode {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        if slow == fast {
            slow = head
            for slow != fast { slow = slow.Next; fast = fast.Next }
            return slow
        }
    }
    return nil
}`
  },
  "add-two-numbers": {
    java: `public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    int carry = 0;
    while (l1 != null || l2 != null || carry != 0) {
        int sum = carry;
        if (l1 != null) { sum += l1.val; l1 = l1.next; }
        if (l2 != null) { sum += l2.val; l2 = l2.next; }
        curr.next = new ListNode(sum % 10);
        curr = curr.next;
        carry = sum / 10;
    }
    return dummy.next;
}`,
    python: `def add_two_numbers(l1, l2):
    dummy = curr = ListNode(0)
    carry = 0
    while l1 or l2 or carry:
        s = carry
        if l1: s += l1.val; l1 = l1.next
        if l2: s += l2.val; l2 = l2.next
        curr.next = ListNode(s % 10)
        curr = curr.next
        carry = s // 10
    return dummy.next`,
    javascript: `function addTwoNumbers(l1, l2) {
    const dummy = new ListNode(0);
    let curr = dummy, carry = 0;
    while (l1 || l2 || carry) {
        let sum = carry;
        if (l1) { sum += l1.val; l1 = l1.next; }
        if (l2) { sum += l2.val; l2 = l2.next; }
        curr.next = new ListNode(sum % 10);
        curr = curr.next; carry = Math.floor(sum / 10);
    }
    return dummy.next;
}`,
    typescript: `function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    const dummy = new ListNode(0);
    let curr: ListNode = dummy, carry: number = 0;
    while (l1 || l2 || carry) {
        let sum: number = carry;
        if (l1) { sum += l1.val; l1 = l1.next; }
        if (l2) { sum += l2.val; l2 = l2.next; }
        curr.next = new ListNode(sum % 10);
        curr = curr.next; carry = Math.floor(sum / 10);
    }
    return dummy.next;
}`,
    csharp: `public ListNode AddTwoNumbers(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    int carry = 0;
    while (l1 != null || l2 != null || carry != 0) {
        int sum = carry;
        if (l1 != null) { sum += l1.val; l1 = l1.next; }
        if (l2 != null) { sum += l2.val; l2 = l2.next; }
        curr.next = new ListNode(sum % 10);
        curr = curr.next;
        carry = sum / 10;
    }
    return dummy.next;
}`,
    cpp: `ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    ListNode dummy(0);
    ListNode* curr = &dummy;
    int carry = 0;
    while (l1 || l2 || carry) {
        int sum = carry;
        if (l1) { sum += l1->val; l1 = l1->next; }
        if (l2) { sum += l2->val; l2 = l2->next; }
        curr->next = new ListNode(sum % 10);
        curr = curr->next;
        carry = sum / 10;
    }
    return dummy.next;
}`,
    go: `func addTwoNumbers(l1 *ListNode, l2 *ListNode) *ListNode {
    dummy := &ListNode{}
    curr := dummy
    carry := 0
    for l1 != nil || l2 != nil || carry != 0 {
        sum := carry
        if l1 != nil { sum += l1.Val; l1 = l1.Next }
        if l2 != nil { sum += l2.Val; l2 = l2.Next }
        curr.Next = &ListNode{Val: sum % 10}
        curr = curr.Next
        carry = sum / 10
    }
    return dummy.Next
}`
  },
  "intersection-of-two-linked-lists": {
    java: `public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
    ListNode a = headA, b = headB;
    while (a != b) {
        a = a == null ? headB : a.next;
        b = b == null ? headA : b.next;
    }
    return a;
}`,
    python: `def get_intersection_node(headA, headB):
    a, b = headA, headB
    while a != b:
        a = headB if a is None else a.next
        b = headA if b is None else b.next
    return a`,
    javascript: `function getIntersectionNode(headA, headB) {
    let a = headA, b = headB;
    while (a !== b) {
        a = a === null ? headB : a.next;
        b = b === null ? headA : b.next;
    }
    return a;
}`,
    typescript: `function getIntersectionNode(headA: ListNode | null, headB: ListNode | null): ListNode | null {
    let a = headA, b = headB;
    while (a !== b) {
        a = a === null ? headB : a.next;
        b = b === null ? headA : b.next;
    }
    return a;
}`,
    csharp: `public ListNode GetIntersectionNode(ListNode headA, ListNode headB) {
    ListNode a = headA, b = headB;
    while (a != b) {
        a = a == null ? headB : a.next;
        b = b == null ? headA : b.next;
    }
    return a;
}`,
    cpp: `ListNode* getIntersectionNode(ListNode* headA, ListNode* headB) {
    ListNode *a = headA, *b = headB;
    while (a != b) {
        a = a ? a->next : headB;
        b = b ? b->next : headA;
    }
    return a;
}`,
    go: `func getIntersectionNode(headA, headB *ListNode) *ListNode {
    a, b := headA, headB
    for a != b {
        if a == nil { a = headB } else { a = a.Next }
        if b == nil { b = headA } else { b = b.Next }
    }
    return a
}`
  },
  "swap-nodes-in-pairs": {
    java: `public ListNode swapPairs(ListNode head) {
    ListNode dummy = new ListNode(0, head);
    ListNode prev = dummy;
    while (prev.next != null && prev.next.next != null) {
        ListNode first = prev.next, second = prev.next.next;
        prev.next = second;
        first.next = second.next;
        second.next = first;
        prev = first;
    }
    return dummy.next;
}`,
    python: `def swap_pairs(head):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next and prev.next.next:
        first, second = prev.next, prev.next.next
        prev.next = second
        first.next = second.next
        second.next = first
        prev = first
    return dummy.next`,
    javascript: `function swapPairs(head) {
    const dummy = new ListNode(0, head);
    let prev = dummy;
    while (prev.next && prev.next.next) {
        const first = prev.next, second = prev.next.next;
        prev.next = second; first.next = second.next; second.next = first;
        prev = first;
    }
    return dummy.next;
}`,
    typescript: `function swapPairs(head: ListNode | null): ListNode | null {
    const dummy = new ListNode(0, head);
    let prev: ListNode = dummy;
    while (prev.next && prev.next.next) {
        const first = prev.next, second = prev.next.next;
        prev.next = second; first.next = second.next; second.next = first;
        prev = first;
    }
    return dummy.next;
}`,
    csharp: `public ListNode SwapPairs(ListNode head) {
    ListNode dummy = new ListNode(0, head);
    ListNode prev = dummy;
    while (prev.next != null && prev.next.next != null) {
        ListNode first = prev.next, second = prev.next.next;
        prev.next = second; first.next = second.next; second.next = first;
        prev = first;
    }
    return dummy.next;
}`,
    cpp: `ListNode* swapPairs(ListNode* head) {
    ListNode dummy(0, head);
    ListNode* prev = &dummy;
    while (prev->next && prev->next->next) {
        ListNode *first = prev->next, *second = prev->next->next;
        prev->next = second; first->next = second->next; second->next = first;
        prev = first;
    }
    return dummy.next;
}`,
    go: `func swapPairs(head *ListNode) *ListNode {
    dummy := &ListNode{Next: head}
    prev := dummy
    for prev.Next != nil && prev.Next.Next != nil {
        first, second := prev.Next, prev.Next.Next
        prev.Next = second
        first.Next = second.Next
        second.Next = first
        prev = first
    }
    return dummy.Next
}`
  }
};
