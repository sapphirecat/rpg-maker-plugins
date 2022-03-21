# Inn Script

How does the `inn-script.txt` file work?

For review, here is the minified script:

	for (const a of $gameParty.members()) {
	  if (a.isDeathStateAffected()) continue;
	  a.setHp(a.mhp); a.setMp(a.mmp); }

Here's an equivalent version, with the lines expanded (and one added)
to make the order clearer than before:

	const actors = $gameParty.members();
	for (const a of actors) {
	  if (a.isDeathStateAffected()) {
	    continue;
	  }
	  a.setHp(a.mhp);
	  a.setMp(a.mmp);
	}

I think this will work fine in RPG Maker, but for longer scripts,
you might run into the limits on how big a script block can be.
So it's good to know how to write the same thing in fewer lines.

## Discussion

The first bit of code is actually only a part of the first line.
We get the list of actors in the current game party:

	$gameParty.members()

This is used in a
[for...of loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of).
_For_ each item in that list (technically, that "array"),
we assign it to a constant `a`, and run the following block of code.

	for (const a of $gameParty.members()) {
	  // code
	}

### Sidebar: var, let, and const

In older JavaScript, `var` created a _local variable for the enclosing function._
Newer JavaScript still supports `var`, but has also added `let` and `const`.
These create _local variables for the code block_ instead.
Loops complicate things, but in general, a variable declared with `let` or `const`
won't exist after the closing-brace containing it.

Using `const` instead of `let` means we can't change what the value "is,"
although it doesn't mean it is unchangeable.  Objects and arrays can have
items added or changed _within_ them, even if they are `const`.

If in doubt, prefer using `let`: it's _genuinely_ local,
and the value can be changed whenever you want.

### Back to the code

Now, we have the actor in `a`, and we run the first line of the body.
Expanded a little, it looks like this:

	if (a.isDeathStateAffected()) {
	  continue;
	}

If the actor we are currently processing is dead, then
we "continue" the loop.  This moves to the next item in the list,
without running any of the remaining code in the block.
Or, if this was the last actor, the loop ends entirely.

We use the `isDeathStateAffected()` method so that the game maker can change
which state is considered "death", or so that other plugins can add
custom death states, and we will recognize them as "dead."

The final line of the function can be expanded into two lines:

	a.setHp(a.mhp);
	a.setMp(a.mmp);

We ask RPG Maker to change the actor's HP and MP to their maximums.
The only thing left is to end the code block (the for...of loop)
with the final curly brace, `}`.

## Basic Alterations

I believe is possible to use `a.setTp(100)` to refill TP to the maximum as well.
But I haven't tested it.

If you wish to remove _some_ states, and you have made this a Common Event,
the best approach is to add "Remove State" commands into the event.
