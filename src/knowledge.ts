interface Topic {
  keywords: string[]
  answer: string
  priority?: number
}

const topics: Topic[] = [
  {
    keywords: ['list', 'lists', 'append', 'array'],
    answer: `Lists hold an ordered, changeable collection of items.

\`\`\`python
fruits = ["apple", "banana"]
fruits.append("cherry")
fruits.remove("apple")
print(fruits[0])
print(len(fruits))
\`\`\`

Use \`sorted(fruits)\` for a sorted copy, or \`fruits.sort()\` to sort in place.`,
  },
  {
    keywords: ['dict', 'dictionary', 'dictionaries', 'key', 'keys'],
    answer: `Dictionaries map keys to values.

\`\`\`python
ages = {"sam": 21, "alex": 30}
ages["jo"] = 25
print(ages.get("sam"))

for name, age in ages.items():
    print(name, age)
\`\`\`

\`get\` returns \`None\` instead of raising \`KeyError\` when a key is missing.`,
  },
  {
    keywords: ['comprehension', 'comprehensions'],
    priority: 1,
    answer: `A comprehension builds a collection in one expression.

\`\`\`python
squares = [n * n for n in range(10)]
evens = [n for n in range(20) if n % 2 == 0]
lookup = {word: len(word) for word in ["hi", "hello"]}
\`\`\`

Keep them short. If it needs more than one condition, a normal loop is often clearer.`,
  },
  {
    keywords: ['loop', 'loops', 'for', 'while', 'range', 'iterate'],
    answer: `\`for\` loops walk over anything iterable. \`while\` loops run until a condition is false.

\`\`\`python
for i in range(3):
    print(i)

for index, item in enumerate(["a", "b"]):
    print(index, item)

count = 0
while count < 3:
    count += 1
\`\`\`

Use \`break\` to stop early and \`continue\` to skip to the next item.`,
  },
  {
    keywords: ['function', 'functions', 'def', 'return', 'arguments', 'args', 'kwargs'],
    answer: `Functions are defined with \`def\`.

\`\`\`python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Sam"))
print(greet("Sam", greeting="Hi"))

def total(*numbers, **options):
    return sum(numbers)
\`\`\`

\`*args\` collects extra positional arguments into a tuple, \`**kwargs\` collects keyword arguments into a dict.`,
  },
  {
    keywords: ['class', 'classes', 'object', 'oop', 'self', 'init'],
    answer: `Classes bundle data and behaviour.

\`\`\`python
class Dog:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} says woof"

rex = Dog("Rex")
print(rex.speak())
\`\`\`

For classes that mostly hold data, look at \`@dataclass\` from the \`dataclasses\` module.`,
  },
  {
    keywords: ['fstring', 'f-string', 'format', 'string', 'strings'],
    answer: `f-strings are the easiest way to format text.

\`\`\`python
name = "Sam"
price = 4.5
print(f"{name} paid £{price:.2f}")
print(f"{'left':<10}|")
print(f"{1234567:,}")
\`\`\`

Common string methods: \`.strip()\`, \`.split()\`, \`.lower()\`, \`.replace()\`, \`.startswith()\`.`,
  },
  {
    keywords: ['error', 'errors', 'exception', 'exceptions', 'try', 'except', 'raise'],
    answer: `Handle errors with \`try\` / \`except\`.

\`\`\`python
try:
    value = int(input("Number: "))
except ValueError:
    print("That wasn't a number")
else:
    print("Got", value)
finally:
    print("Done")
\`\`\`

Catch specific exceptions rather than a bare \`except:\` so real bugs still show up.`,
  },
  {
    keywords: ['file', 'files', 'open', 'read', 'write', 'csv'],
    answer: `Use \`with open(...)\` so the file is closed for you.

\`\`\`python
with open("notes.txt", "w") as f:
    f.write("hello\\n")

with open("notes.txt") as f:
    for line in f:
        print(line.strip())
\`\`\`

For CSV files, the built-in \`csv\` module handles quoting and commas inside values.`,
  },
  {
    keywords: ['import', 'module', 'modules', 'pip', 'package', 'install', 'venv'],
    answer: `Install packages into a virtual environment so projects don't clash.

\`\`\`bash
python -m venv .venv
source .venv/bin/activate
pip install requests
\`\`\`

On Windows, activate with \`.venv\\Scripts\\activate\`. Then \`import requests\` in your code.`,
  },
  {
    keywords: ['tuple', 'tuples', 'set', 'sets', 'unpack'],
    priority: 0.5,
    answer: `Tuples are fixed sequences, sets hold unique items.

\`\`\`python
point = (3, 4)
x, y = point

tags = {"python", "code", "python"}
print(tags)
print("code" in tags)
\`\`\`

Sets make membership checks fast and are handy for removing duplicates: \`list(set(items))\`.`,
  },
]

const fallback = `I can help with Python basics offline: lists, dicts, loops, functions, classes, strings, errors, files, packages and comprehensions.

Add a Claude API key in settings for full answers to anything else.`

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z_-]+/g) ?? []
}

export function localAnswer(question: string): string {
  const tokens = new Set(words(question))
  let best: Topic | undefined
  let bestScore = 0
  for (const topic of topics) {
    const score = topic.keywords.filter((k) => tokens.has(k)).length
    const weighted = score + (score > 0 ? topic.priority ?? 0 : 0)
    if (weighted > bestScore) {
      best = topic
      bestScore = weighted
    }
  }
  return best ? best.answer : fallback
}
