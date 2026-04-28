#!/usr/bin/env python3
import sys, json

def main():
    if len(sys.argv) < 2:
        print("No input file", file=sys.stderr); sys.exit(2)
    path = sys.argv[1]
    with open(path) as f:
        data = json.load(f)
    # Example: just print a summary
    answers = data.get('answers', [])
    print(f"Received {len(answers)} answers")
    # add real processing below

if __name__ == '__main__':
    main()

