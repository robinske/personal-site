---
layout:    post
title:     "Practical Computing"
date:      2016-03-31
permalink: /posts/:title
tags:      programming 
comments:  true
active:    "blog"
---

There was a gem of "practical computing" advice nested in the comments of a Fred Wilson blog post today. Full credit to [signmaalgebra](https://disqus.com/by/sigmaalgebra/) for this comprehensive overview, included in full below. ([Original comment](http://avc.com/2016/03/side-projects/#comment-2600129704))

<div class="line"></div>

At least at first, what you may need is really just an introduction to practical computing and not really computer science.

The Internet, especially Wikipedia, should be quite good as sources.

For an introduction here, consider an outline:

#### The Core of a Computer

Read a little about each of processors, processor clocks, machine instructions, main memory, memory addressing, programs, disk storage, other peripherals.

Learn the basics of counting in base 2 and base 16.

Get the basics of speeds, capacities, costs, principles of operation.

With those basics in place, learn about cache memory, processor cores, virtual memory, and virtual machine.

#### Operating Systems

Likely from your usage of computers, you already know the basics of operating systems and, likely, file systems -- e.g., Microsoft's new technology file system (NTFS).

The history of operating systems is huge, but for now you can concentrate on versions of Linux and/or Windows.

#### Programming Languages

The main programming languages are all more similar to each other than, say, French and Spanish or German and English.

The basics are elementary data types, elementary data structures, especially arrays, naming and allocating storage.

Then get an introduction to the basic programming statements -- if-then-else, select-when, do-while (and variations), call-return, and facilities for input and output.

#### Object Oriented Programming

Take a cake recipe and call it an object-oriented class. Each of the ingredients in the recipe -- flour, butter, sugar, eggs, chocolate -- is a property of the class. Each operation in baking the cake -- measuring, mixing, beating, pouring, baking, cooling, etc. -- works on the properties and is a method. But, can't eat the recipe; indeed, it doesn't have even a single egg with it.

So a particular cake made from the recipe is an instance of the class.

It may be that there is a master recipe for just one layer of cake -- no one ever uses that recipe alone.

Then from this master recipe can make cakes with chocolate, lemon, almond, soaked with sugar syrup, rum, Kirschwasser, filled with apricot jam or cherries, coated with butter cream, whipped cream, chocolate curls, marshmallow cream, etc. Each of these more specific cakes inherits from the master recipe. In object-oriented programming, so it is with classes.

An important application:

When you use a computer with a Web browser to visit a Web site, the first thing you do is send the Web server a request GET. Here you also send to the Web server some standard data on you, e.g., the computer operating system you are using, the Web browser you are using, of course your IP address. The Web server then creates for you a logical session with a session identifier (ID) and sends the page, with the session ID, back to you.

When you get the Web page back, if fill in a text box, a check box, a radio button, click on a button, image, or a link, then you send back to the Web server a POST with the data you entered and your session ID.

So, the programmer of the Web server has to list what data they want to keep on (about) logical sessions. Typically there is an object oriented class for that data, with lots of properties but maybe few or no methods, and there is an instance of that class for your logical session. That class is the session state.

While you are reading one of the Web pages, your instance of that session state class is stored in some session state store -- e.g., Redis (I wrote my own).

That store is a key-value store: The key is your session ID, and the value is your instance of the session state class (see AVL trees and B-trees below).

In the code of the Web pages, sending a session ID key to the session state store causes the session state store to return the corresponding session state instance.

Typically what send/receive from the session state store is just an array (list) of bytes. So, given an instance of the session state class, need to convert that instance to/from such a byte array. For this, object-oriented languages typically have a way do de/serialize between a class instance and a byte array. In particular, e.g., in what I wrote, the session state store just receives, stores, and returns byte arrays.

#### Relational Database

Typically a program reads/writes data from/to files on a file system on a hard disk drive.

Then, sure, other programs may want to make use of some or all of that data on the disk drive. And, sure, over time, the problems the programs solve may change so that the programs have to change so that, maybe, the data in the files has to change. Keeping up with the changes, etc. was long seen as way too much work, that a better approach was needed -- database software to sit between the program and the file system on the disk drive.

Broadly, the approaches to database settled down to versions of hierarchical, network, and relational. Mostly relational won out, and in the 1970s M. Blasgen at IBM and E. Wong at Berkeley made progress. IBM's work resulted in DB/2 (database 2) and Wong's work resulted in INGRES.

First cut, relational database is just dirt simple: A database consists of tables. Each table has rows and columns. Each column is for some one variable, say, date, name, street, city, state, zip code, phone area code, phone number, account balance.

Each row has such data for some one person.

Or if not a person then a unit of inventory, a customer, a 1040 tax form, etc.

Typically a table has a key, some data unique for each row. Then given the key, getting or changing the row with the key is much faster than otherwise. Well, what key? The principle is third normal form where each row is a function of its key, the whole key, and nothing but the key. Then third normal form is one of the first lessons in designing the tables of a relational database.

Especially important about relational database are ease of use for the common work that was considered too difficult, relatively easy ways to respond to changes, reliability, and security. After a lot of work, now performance can be considered surprisingly good.

Part of the reliability of relational data is from transactions. The classic example is a bank customer moving money from checking to savings. So, even if the computer fails during the work, when the computer is running again, want the work either completely done or completely undone. So, want the work to be an atomic transaction. Relational database achieves this, and just how is worth understanding.

Maybe two programs are trying to do transactions on one database. Maybe program X is using table A but also needs table B, and program Y is using table B but needs to use table A. So, neither program X nor Y can continue. But program X has already made some changes to table A which must be undone if program X is to stop; similarly for program Y and changes to table B. So, relational database needs means of automatic (transparent to the programmers) of deadlock detection and resolution. Yup, relational database has that.

For more, as at

[https://en.wikipedia.org/wiki/...](https://en.wikipedia.org/wiki/ACID)

look up ACID

> In computer science, ACID (Atomicity, Consistency, Isolation, Durability) is a set of properties that guarantee that database transactions are processed reliably.
There is a special programming language for communicating with relational database called structured query language (SQL). Commonly some quite complicated database operations can be specified in a SQL statement of just a dozen or so lines.

There are several relational database software products, DB/2 from IBM, SQL Server from Microsoft, MySQL from Oracle, etc.

#### Computer Science

=== Parsing

Early in computer science was Bachus-Naur form (BNF). This is a way to specify the syntax of a programming language.

In such work a programming language is a set (as in mathematics) of strings of characters where each string is a legal program in the language. Then BNF is basically some specialized notation for some traditional operations in set theory that specify the full set of strings, that is, the language.

Next, need to write a program that will take a string and determine if it is legal in the language and parse the string into the more elementary parts of the language. Well, some early work in computer science showed that, given the BNF for a language, could, from the BNF, essentially automatically write a computer program that would take any string, check if it was legal in the language, and, if so, parse it.

Such parsing is an early part of a compiler for a programming language, that is, that translates a program to machine instructions or something close to machine instructions.

If you want to write a compiler, then maybe you will want more details.

For more, see the work of Frank DeRemer on LALR parsing.

=== Algorithms and Data Structures

There is still the now quite old

Donald E. Knuth, The Art of Computer Programming, Volume 3, Sorting and Searching,

That volume has much of the part of computer science called algorithms and data structures.

The most important algorithms are for sorting and searching. The most important sorting algorithms are merge sort and heap sort.

The most important data structures are trees, and the two most important tree algorithms are AVL trees (mostly for data in main memory -- by two guys in Russia) and B-trees (work of Bayer & McCreight -- at Boeing) mostly for data on hard disk and likely commonly used at the lower levels of relational database software.

Both of these trees are balanced in that each of the leaves is about the same number of branches away from the root of the tree, even if the tree is continually changed with insertions and deletions. Just how to do that, with good performance, is clever.

Now object-oriented programming languages commonly have collection classes, and the good versions of these are likely based on AVL trees or the more recent and comparable red-black trees and are essentially main memory key-value stores.

Heap sort also uses an important, but very simple, data structure called a heap which is really just a clever, fast, efficient way to store a tree where at each node there are only two branches.

A lecture of one hour can give you the important high points of algorithms and data structures -- you have a good start just from here.

There is much, much more in algorithms and data structures, but nearly all the important parts of such work are really in various parts of applied mathematics, not computer science.

=== Machine Learning

The current hot field of computer science is machine learning, but that is really basically some classic multivariate statistics but done on a large scale.

=== P versus NP

Computer science has a challenging, unsolved problem, P versus NP. The applied math community also regards this problem as theirs. The problem is a deep, shocking, profound question in computational complexity. On the Internet, there are plenty of introductions and as much more as you could wish.

#### Ethernet and LAN

Learn a little about local area networks (LANs) and, from Google,

> A media access control address (MAC address), also called physical address, is a unique identifier assigned to network interfaces for communications on the physical network segment. MAC addresses are used as a network address for most IEEE 802 network technologies, including Ethernet and WiFi.
So, that's a start on how the signals on the Ethernet cable on your computer are handled.

You can have a LAN switch which permits connecting many computers and other devices in one communications network.

#### Internets and the Internet

Learn about internet protocol (IP) addresses, version 4, IPv4 now and version 6, IPv6, later, routing, the domain name system (DNS), internet access providers (ISPs), static versus dynamic IP addresses, domain name registration, etc.

Read about transmission control protocol (TCP) and internet protocol (IP) for TCP/IP and TCP/IP sockets, the work-horse of the Internet.

Look at the applications programming interface (API), that is, the collection of software functions can call, for TCP/IP socket communications. Maybe write a simple program that uses sockets.

#### E-mail

A first, really simple, application of TCP/IP is e-mail, e.g., with post office protocol 3 (POP3).

There learn about multimedia internet mail extensions (MIME) that permits sending pictures, music, etc. via e-mail.

Move up from there to understanding hypertext transfer protocol (HTTP -- similar to e-mail) and, then, hypertext markup language (HTML). To help set colors, fonts, text sizes, etc., see how cascading style sheets (CSS) work.

#### Gibberish

Practical computing is just awash in gibberish, e.g., of three letter acronyms (TLAs) -- e.g., ATX, EATX, EIDE, SCSI, SATA, USB, and on and on.

Good news: Nearly all of this silly gibberish is, at the level of a user, conceptually dirt simple, and an Internet search and a few minutes can yield a good description.

So, don't get stuck on the gibberish.

The above should be a good start.

Okay, some more:

#### Programming from 100 Feet up

If you have a significant piece of software to write, then use divide and conquer. To do this, look at the real problem and partition the work into pieces where hopefully the pieces are relatively independent, each piece is relatively easy to understand and test, and the pieces are relatively robust to small modifications in the original problem.

The main, classic means of partitioning are functions (or, if you prefer, subroutines).

E.g., there is a function for calculating square root. You could write a function to take two dates and return the number of days between them. For the airline fleet scheduling I did at FedEx, I had a function to take latitude and longitude for two points and calculate the great circle distance between them (basically the law of cosines for spherical triangles). Maybe you could write a function to take a JPG file and write some text, say, a date and your name, near the bottom, right corner.

The place in the program where the execution starts is commonly called the main program. Okay -- it's nice if you can have good enough problem partitioning to make the main program just dirt simple:

>get input
>
>do the work
>
>report the output
>
>catch any exceptional conditions and give a good message on what went wrong
In the part doing the work, hopefully that will partition similarly.

So, with all this partitioning, hopefully for each function, there is a really nice, simple description of what the function does.

Sure, when write the program, have to create lots of names, for storage, classes, functions, etc. So, right, create mnemonic names.

Still, mnemonic names or not, when such a program is written, only the programmer and God understand it, and, six months later, only God -- unless you write lots of, say, English comments that explain what the heck the program is doing and how it does it.

If you want such software to be a significant asset (considering how much it cost, you should), then you must do really well writing such comments. Commonly the comments will be more important than the rest, and the writing can be more challenging for the comments than the programming language statements. Right, good programmers need to know how to do well writing English.

Or, think of a text in freshman physics and regard the displayed equations as like the code and the text as like the comments. Really.

Indeed, there may be lots of external documentation with no code at all.

#### Typing

Piano playing requires hitting keys. Programming requires typing.

Broadly you have two choices for the target of the typing, (1) a good text editor (with a good way to write macros) and (2) an integrated development environment (IDE).

I just use a good text editor (KEdit), but an IDE can be better in various respects.

#### Teams

Significant programming projects need teams, and the team members have to coordinate. So, there is a severe management challenge. Relevant tools can be an IDE and a code repository, e.g., Github.

#### Programming Skills

Starting with little or no background in computing, getting proficient with a first, serious programming language can take a year of full time work.

There can be much more time for getting good with various specializations.

One valuable approach to get past tricky issues for the first time is to get paid support from specialized experts.

#### Database Skills

Getting good with a high end application of relational database, say, for a major bank, is a specialized, full-time job.

One valuable approach to get past tricky issues for the first time is to get paid support from specialized experts.

Go for it!

