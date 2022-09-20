from pyteal import *


class BlogContract:
    class Variables:
        title = Bytes("TITLE")  # ByteSlice
        image = Bytes("IMAGE")  # ByteSlice
        content = Bytes("CONTENT")  # ByteSlice
        upvote = Bytes("UPVOTE")  # Uint64
        downvote = Bytes("DOWNVOTE")  # Uint64

    class AppMethods:
        upvote = Bytes("upvote")
        downvote = Bytes("downvote")
        edit = Bytes("edit")

    # to create a new property listed for adoption
    def application_creation(self):
        return Seq([
            # The number of arguments attached to the transaction should be exactly 5.
            Assert(Txn.application_args.length() == Int(3)),

            # The note attached to the transaction must be "tutorial-marketplace:uv1", which we define to be the note that marks a product within our marketplace
            Assert(Txn.note() == Bytes("blog-dapp:uv2")),

            # Store the transaction arguments into the applications's global's state
            App.globalPut(self.Variables.title, Txn.application_args[0]),
            App.globalPut(self.Variables.image, Txn.application_args[1]),
            App.globalPut(self.Variables.content, Txn.application_args[2]),
            App.globalPut(self.Variables.upvote, Int(0)),
            App.globalPut(self.Variables.downvote, Int(0)),

            Approve(),
        ])

    def edit(self):

        Assert(
            And(
                    # The number of transactions within the group transaction must be exactly 2.
                    # first one being the adopt function and the second being the payment transactions
                    Global.group_size() == Int(1),

                    # check that the buy call is made ahead of the payment transaction
                    Txn.group_index() == Int(0),
                    
                    # check if the app creator is the one that call edit 
                    Txn.sender() == Global.creator_address(),

                    # Txn.applications[0] is a special index denoting the current app being interacted with
                    Txn.applications.length() == Int(1),

                    # The number of arguments attached to the transaction should be exactly 2.
                    Txn.application_args.length() == Int(4),
            ),
        )


        return Seq([
            App.globalPut(self.Variables.title, Txn.application_args[1]),
            App.globalPut(self.Variables.content, Txn.application_args[2]),
            App.globalPut(self.Variables.image, Txn.application_args[3]),
            Approve()
        ])

    # upvote
    def upvote(self):

        Assert(
            And(
                    # The number of transactions within the group transaction must be exactly 2.
                    # first one being the adopt function and the second being the payment transactions
                    Global.group_size() == Int(1),

                    # Txn.applications[0] is a special index denoting the current app being interacted with
                    Txn.applications.length() == Int(1),

                    # The number of arguments attached to the transaction should be exactly 2.
                    Txn.application_args.length() == Int(1),

            ),
        )

        return Seq([
            App.globalPut(self.Variables.upvote, App.globalGet(self.Variables.upvote) + Int(1)),
            Approve()
        ])


    # upvote
    def downvote(self):

        Assert(
            And(
                    # The number of transactions within the group transaction must be exactly 2.
                    # first one being the adopt function and the second being the payment transactions
                    Global.group_size() == Int(1),

                    # Txn.applications[0] is a special index denoting the current app being interacted with
                    Txn.applications.length() == Int(1),

                    # The number of arguments attached to the transaction should be exactly 2.
                    Txn.application_args.length() == Int(1),
            ),
        )

        return Seq([
            App.globalPut(self.Variables.downvote, App.globalGet(self.Variables.downvote) + Int(1)),
            Approve()
        ])

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
            [Txn.on_completion() == OnComplete.DeleteApplication,
             self.application_deletion()],
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