from pyteal import *
from util import convert_uint_to_bytes


class BlogContract:
    class Variables:  # 2 global ints. 9 global bytes
        title = Bytes("TITLE")  # ByteSlice
        image = Bytes("IMAGE")  # ByteSlice
        upvote = Bytes("UPVOTE")  # Uint64
        downvote = Bytes("DOWNVOTE")  # Uint64
        # for the blog content we'll fill up the 8 key value pairs with 127 bytes each using key indexes 0 - 7,  as we're only allowed 128 bytes per key value pair
        # with this we can then increase the blog content by 900 bytes, we can't go higher than this on app creation as doing so will return the dynamic cost budget exceeded error as Teal has local program cost max of 700 and this exceeds it

    class AppMethods:
        upvote = Bytes("upvote")
        downvote = Bytes("downvote")
        edit = Bytes("edit")

    @Subroutine(TealType.none)
    def fill_blog(blog_data: Expr):
        counter = ScratchVar(TealType.uint64)
        length_of_bytes = ScratchVar(TealType.uint64)
        length_of_bytes_to_store = ScratchVar(TealType.uint64)
        starting_index = ScratchVar(TealType.uint64)
        current_bytes = ScratchVar(TealType.bytes)
        key_index = ScratchVar(TealType.bytes)
        return Seq(
            [
                length_of_bytes.store(Len(blog_data)),
                # iterate through indexes from 0 - 7
                For(
                    counter.store(Int(0)),
                    counter.load() < Int(8),
                    counter.store(counter.load() + Int(1)),
                ).Do(
                    # convert index to string
                    key_index.store(convert_uint_to_bytes(counter.load())),
                    # store starting index
                    starting_index.store(Int(127) * counter.load()),
                    # if length of bytes is equal to zero
                    If(length_of_bytes.load() == Int(0)).Then(
                        # break out of loop
                        Break()
                    )
                    # else if remaining length of blog data bytes is greater than 127.
                    .ElseIf(length_of_bytes.load() > Int(127))
                    .Then(
                        Seq(
                            [
                                # reduce bytes length by 125
                                length_of_bytes.store(
                                    length_of_bytes.load() - Int(127)
                                ),
                                # store the length of bytes to store
                                length_of_bytes_to_store.store(Int(127)),
                            ]
                        )
                    )
                    .Else(
                        # store the length of bytes left to store
                        length_of_bytes_to_store.store(length_of_bytes.load()),
                        # update length_of_bytes
                        length_of_bytes.store(
                            length_of_bytes.load() - length_of_bytes_to_store.load()
                        ),
                    ),
                    # Extract bytes from blog_data
                    current_bytes.store(
                        Extract(
                            blog_data,
                            starting_index.load(),
                            length_of_bytes_to_store.load(),
                        )
                    ),
                    # Store bytes in global state
                    App.globalPut(key_index.load(), current_bytes.load()),
                ),
            ]
        )

    # to create a new blog.s
    def application_creation(self):
        return Seq(
            [
                Assert(
                    And(
                        # The number of arguments attached to the transaction should be exactly 3.
                        Txn.application_args.length() == Int(3),
                        # The note attached to the transaction must be "blog-dapp:uv01",
                        Txn.note() == Bytes("blog-dapp:uv03"),
                    )
                ),
                # Store the transaction arguments into the applications's global's state
                App.globalPut(self.Variables.title, Txn.application_args[0]),
                App.globalPut(self.Variables.image, Txn.application_args[1]),
                App.globalPut(self.Variables.upvote, Int(0)),
                App.globalPut(self.Variables.downvote, Int(0)),
                # fill blog in global state
                self.fill_blog(Txn.application_args[2]),
                Approve(),
            ]
        )

    def edit(self):
        Assert(
            And(
                # check if the app creator is the one that call edit
                Txn.sender() == Global.creator_address(),
                # The number of arguments attached to the transaction should be exactly 4.
                Txn.application_args.length() == Int(4),
            ),
        )

        return Seq(
            [
                App.globalPut(self.Variables.title, Txn.application_args[1]),
                App.globalPut(self.Variables.image, Txn.application_args[2]),
                # update blog data
                self.fill_blog(Txn.application_args[3]),
                Approve(),
            ]
        )

    # upvote
    def upvote(self):
        Assert(
            # app creator not equal to transaction sender, so writer won't be able to upvote his own blog
            Global.creator_address()
            != Txn.sender(),
        )

        return Seq(
            [
                App.globalPut(
                    self.Variables.upvote, App.globalGet(self.Variables.upvote) + Int(1)
                ),
                Approve(),
            ]
        )

    # upvote

    def downvote(self):
        Assert(
            # app creator not equal to transaction sender, so writer won't be able to upvote his own blog
            Global.creator_address()
            != Txn.sender(),
        )

        return Seq(
            [
                App.globalPut(
                    self.Variables.downvote,
                    App.globalGet(self.Variables.downvote) + Int(1),
                ),
                Approve(),
            ]
        )

    # To delete a property.
    def application_deletion(self):
        return Return(Txn.sender() == Global.creator_address())

    # Check transaction conditions
    def application_start(self):
        return Cond(
            # checks if the application_id field of a transaction matches 0.
            # If this is the case, the application does not exist yet, and the application_creation() method is called
            [Txn.application_id() == Int(0), self.application_creation()],
            # If the the OnComplete action of the transaction is DeleteApplication, the application_deletion() method is called
            [
                Txn.on_completion() == OnComplete.DeleteApplication,
                self.application_deletion(),
            ],
            # if the first argument of the transaction matches the AppMethods.buy value, the buy() method is called.
            [Txn.application_args[0] == self.AppMethods.edit, self.edit()],
            [Txn.application_args[0] == self.AppMethods.upvote, self.upvote()],
            [Txn.application_args[0] == self.AppMethods.downvote, self.downvote()],
        )

    # The approval program is responsible for processing all application calls to the contract.
    def approval_program(self):
        return self.application_start()

    # The clear program is used to handle accounts using the clear call to remove the smart contract from their balance record.
    def clear_program(self):
        return Return(Int(1))
